# SKILL: Contract Analysis
# Trigger: any task involving building, modifying, or debugging the contract
#          analysis prompt, Claude API call, or analysis output parsing.

## What this skill covers
- Building the multilingual system prompt for contract analysis
- Calling the Claude API with PDF/image/text payloads
- Parsing and validating the structured JSON response
- Handling all error cases gracefully

---

## THE CANONICAL SYSTEM PROMPT

Use this exact structure. Never shorten or simplify it.

```typescript
export function buildContrivoxPrompt(langCode: string): string {
  const lang = LANG_NAMES[langCode] ?? "English";
  return `You are Contrivox, an expert contract analyst helping everyday people
understand legal documents. You MUST write every word of your response in
${lang} — including all JSON field values, titles, descriptions, labels,
and the disclaimer. No exceptions.

The only field exempt from translation is score_label, which must remain
one of these exact English enum values: Fair | Acceptable | Concerning |
Unfair | Dangerous (used for colour-coding only).

Return ONLY a valid JSON object — no markdown fences, no preamble, no
text outside the JSON:

{
  "contract_type": "string in ${lang}",
  "summary": "string in ${lang} — 3-sentence plain-language overview",
  "parties": ["string in ${lang}"],
  "key_clauses": [{
    "title": "string in ${lang}",
    "plain_english": "string in ${lang} — simple explanation for a 16-year-old",
    "risk_level": "low" | "medium" | "high",
    "risk_note": "string in ${lang} or null"
  }],
  "red_flags": [{
    "issue": "string in ${lang}",
    "why_it_matters": "string in ${lang} — real-world impact",
    "challenge": "string in ${lang} — exact negotiation wording",
    "challengeable": true | false
  }],
  "missing_protections": ["string in ${lang}"],
  "score": integer 0-100,
  "score_label": "Fair" | "Acceptable" | "Concerning" | "Unfair" | "Dangerous",
  "score_reasoning": "string in ${lang} — 2 sentences",
  "overall_recommendation": "string in ${lang} — 2-3 sentences",
  "disclaimer": "string in ${lang} — legal disclaimer"
}

Rules:
1. Every text value MUST be in ${lang}. Any other language = failure.
2. score < 40 for clearly one-sided contracts.
3. score > 70 only for genuinely balanced contracts.
4. challengeable = false ONLY for government-mandated clauses.
5. challenge must be a concrete negotiation script, not generic advice.
6. Plain language throughout — no legalese whatsoever.
7. NEVER include PII from the document in your response beyond party names.
8. NEVER reproduce verbatim contract text — paraphrase all content.`;
}
```

---

## API CALL PATTERN

```typescript
// lib/claude.ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // server only — never expose
});

export type FilePayload =
  | { type: "image"; data: string; mediaType: string }
  | { type: "pdf";   data: string }
  | { type: "text";  text: string };

export async function analyseContract(
  payload: FilePayload,
  langCode: string
): Promise<ContrivoxAnalysis> {
  let userContent: Anthropic.MessageParam["content"];

  if (payload.type === "image") {
    userContent = [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: payload.mediaType as "image/jpeg",
          data: payload.data,
        },
      },
      { type: "text", text: "Analyse this contract document fully." },
    ];
  } else if (payload.type === "pdf") {
    userContent = [
      {
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: payload.data,
        },
      },
      { type: "text", text: "Analyse this contract document fully." },
    ];
  } else {
    userContent = `Analyse this contract:\n\n${payload.text}`;
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: buildContrivoxPrompt(langCode),
    messages: [{ role: "user", content: userContent }],
  });

  const raw = message.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .replace(/```json\n?|\n?```/g, "")
    .trim();

  // Validate before returning
  return ContrivoxAnalysisSchema.parse(JSON.parse(raw));
}
```

---

## VALIDATION SCHEMA (Zod)

```typescript
// lib/validation.ts
import { z } from "zod";

export const ContrivoxAnalysisSchema = z.object({
  contract_type: z.string().min(1).max(200),
  summary: z.string().min(10).max(2000),
  parties: z.array(z.string().max(200)).max(10),
  key_clauses: z.array(z.object({
    title: z.string().max(300),
    plain_english: z.string().max(1000),
    risk_level: z.enum(["low", "medium", "high"]),
    risk_note: z.string().max(500).nullable(),
  })).max(30),
  red_flags: z.array(z.object({
    issue: z.string().max(500),
    why_it_matters: z.string().max(1000),
    challenge: z.string().max(1000),
    challengeable: z.boolean(),
  })).max(20),
  missing_protections: z.array(z.string().max(500)).max(20),
  score: z.number().int().min(0).max(100),
  score_label: z.enum(["Fair", "Acceptable", "Concerning", "Unfair", "Dangerous"]),
  score_reasoning: z.string().max(1000),
  overall_recommendation: z.string().max(1500),
  disclaimer: z.string().max(500),
});

export type ContrivoxAnalysis = z.infer<typeof ContrivoxAnalysisSchema>;
```

---

## ERROR HANDLING

Always handle these cases explicitly:

```typescript
try {
  return await analyseContract(payload, langCode);
} catch (error) {
  if (error instanceof Anthropic.APIError) {
    if (error.status === 429) throw new AppError("rate_limited", 429);
    if (error.status === 529) throw new AppError("overloaded", 503);
    throw new AppError("api_error", 502);
  }
  if (error instanceof SyntaxError) throw new AppError("parse_error", 502);
  if (error instanceof z.ZodError)  throw new AppError("validation_error", 502);
  throw new AppError("unknown", 500);
}
```

---

## SUPPORTED LANGUAGES

```typescript
export const LANG_NAMES: Record<string, string> = {
  en: "English",
  pt: "Brazilian Portuguese",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  uk: "Ukrainian",
  pl: "Polish",
  ar: "Arabic",
  zh: "Chinese (Simplified)",
  ja: "Japanese",
  ru: "Russian",
};
```

---

## SECURITY CHECKLIST FOR THIS SKILL

- [ ] API key only in `process.env.ANTHROPIC_API_KEY` (server-side)
- [ ] File payload validated for MIME type before calling Claude
- [ ] Response validated with Zod before returning to client
- [ ] Token usage logged per request
- [ ] PII not logged (contract content never enters logs)
