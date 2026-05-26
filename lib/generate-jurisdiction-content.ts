import Anthropic from "@anthropic-ai/sdk";
import { JurisdictionContentSchema, type JurisdictionContent, type ClauseSeed } from "./seo-types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `You are a senior legal content writer for Contrivox, an AI contract analysis platform. You specialise in how contract clauses operate across different jurisdictions — US states, UK, EU, Australia, and Canada. You write clear, accurate, genuinely useful content for non-lawyers who need to understand what a specific clause means in their specific location. Content is SEO-optimised, legally precise but accessible, and always includes an appropriate disclaimer to consult a lawyer.`;

function buildPrompt(
  clause: Pick<ClauseSeed, "slug" | "name" | "definition_seed" | "key_risks">,
  jurisdictionName: string,
  strict = false,
): string {
  const base = `Write a comprehensive jurisdiction-specific guide about the "${clause.name}" as it applies in ${jurisdictionName}.

Clause background:
- Definition: ${clause.definition_seed ?? "A common contract clause"}
- Key risks: ${(clause.key_risks ?? []).join("; ")}

Return JSON with EXACTLY this structure (no other text):
{
  "meta_title": "55-60 char SEO title — e.g. '${clause.name} in ${jurisdictionName}: Enforceable? | Contrivox'",
  "meta_description": "155-165 char meta description targeting '${clause.name.toLowerCase()} ${jurisdictionName.toLowerCase()}'",
  "h1": "Question-format H1 — e.g. 'Are ${clause.name}s Enforceable in ${jurisdictionName}?'",
  "intro_paragraph": "2-3 sentences introducing the clause in the ${jurisdictionName} legal context (60-100 words)",
  "enforceability": {
    "verdict": "one of: enforceable | limited | unenforceable | varies",
    "verdict_label": "e.g. 'Generally Enforceable' / 'Largely Unenforceable' / 'Enforceable With Restrictions' / 'Highly Variable'",
    "explanation": "2-3 sentences explaining the verdict with ${jurisdictionName}-specific legal context"
  },
  "key_rules": [
    { "rule": "Short rule title", "detail": "2-sentence ${jurisdictionName}-specific explanation" }
  ],
  "recent_changes": "1-2 sentences on recent ${jurisdictionName} law changes, or null if none noteworthy",
  "how_it_differs": "1-2 sentences comparing ${jurisdictionName} to the general/federal standard",
  "negotiation_tips": ["3-4 tips specific to contracts governed by ${jurisdictionName} law"],
  "faqs": [
    { "question": "Is a ${clause.name.toLowerCase()} enforceable in ${jurisdictionName}?", "answer": "3-4 sentence answer" }
  ],
  "cta_hook": "1 sentence CTA mentioning Contrivox AI contract analysis"
}

Requirements:
- key_rules: 3-5 items
- faqs: 4-5 items with ${jurisdictionName}-specific questions
- All content must be specific to ${jurisdictionName} — no generic statements that apply everywhere
- Do not fabricate case citations or case names
- Include 'consult a lawyer' or equivalent qualifier
- cta_hook must mention Contrivox`;

  return strict
    ? base + "\n\nCRITICAL: Return ONLY valid JSON. No markdown fences. No text before or after the JSON object."
    : base + "\n\nReturn only valid JSON. No markdown, no preamble.";
}

export async function generateJurisdictionContent(
  clause: Pick<ClauseSeed, "slug" | "name" | "definition_seed" | "key_risks">,
  jurisdictionSlug: string,
  jurisdictionName: string,
): Promise<JurisdictionContent> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const message = await client.messages.create({
        model:      "claude-sonnet-4-6",
        max_tokens: 2500,
        system:     SYSTEM_PROMPT,
        messages:   [{ role: "user", content: buildPrompt(clause, jurisdictionName, attempt === 2) }],
      });

      const raw = message.content
        .filter((b) => b.type === "text")
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("")
        .replace(/^```json\s*/m, "")
        .replace(/\s*```$/m, "")
        .trim();

      const content = JurisdictionContentSchema.parse(JSON.parse(raw));

      if (!/contrivox/i.test(content.cta_hook)) {
        throw new Error("cta_hook does not mention Contrivox");
      }

      return content;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < 2) await new Promise((r) => setTimeout(r, 3000));
    }
  }

  throw lastError ?? new Error(`Failed to generate jurisdiction content for ${clause.slug}/${jurisdictionSlug}`);
}
