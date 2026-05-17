import Anthropic from "@anthropic-ai/sdk";
import { ContrivoxAnalysisSchema, type ContrivoxAnalysis } from "./validation";

// Singleton — instantiated once, reused across requests
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!, // server-side only
});

// Add entries here as new output languages are enabled.
const LANG_NAMES: Record<string, string> = {
  en: "English",
};

export function buildContrivoxPrompt(langCode: string): string {
  const lang = LANG_NAMES[langCode] ?? "English";
  return `You are Contrivox, an expert contract analyst helping everyday people understand legal documents. You MUST write every word of your response in ${lang} — including all JSON field values, titles, descriptions, labels, and the disclaimer. No exceptions.

The only field exempt from translation is score_label, which must remain one of these exact English enum values: Fair | Acceptable | Concerning | Unfair | Dangerous

Return ONLY a valid JSON object — no markdown fences, no preamble, no text outside the JSON:

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
2. score < 40 for clearly one-sided contracts. score > 70 for genuinely balanced contracts.
3. challengeable = false ONLY for government-mandated clauses.
4. challenge must be a concrete negotiation script, not generic advice.
5. Plain language throughout — no legalese whatsoever.
6. NEVER include PII from the document beyond party names.
7. NEVER reproduce verbatim contract text — always paraphrase.`;
}

export type FilePayload =
  | { type: "image"; data: string; mediaType: string }
  | { type: "pdf";   data: string }
  | { type: "text";  text: string };

export class AppError extends Error {
  constructor(
    public code: string,
    public status: number,
    message?: string
  ) {
    super(message ?? code);
  }
}

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
          media_type: payload.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: payload.data,
        },
      },
      { type: "text", text: "Analyse this contract document fully according to your instructions." },
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
      { type: "text", text: "Analyse this contract document fully according to your instructions." },
    ];
  } else {
    userContent = `Analyse this contract:\n\n${payload.text}`;
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: buildContrivoxPrompt(langCode),
      messages: [{ role: "user", content: userContent }],
    });

    // Log token usage for cost tracking (no content logged)
    console.log("[claude] tokens:", {
      input: message.usage.input_tokens,
      output: message.usage.output_tokens,
    });

    const raw = message.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .replace(/```json\n?|\n?```/g, "")
      .trim();

    const parsed = JSON.parse(raw);
    return ContrivoxAnalysisSchema.parse(parsed);
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      if (err.status === 429) throw new AppError("rate_limited", 429);
      if (err.status === 529) throw new AppError("overloaded", 503);
      throw new AppError("api_error", 502);
    }
    if (err instanceof SyntaxError) throw new AppError("parse_error", 502);
    throw new AppError("unknown", 500);
  }
}
