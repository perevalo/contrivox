import Anthropic from "@anthropic-ai/sdk";
import { ZodError } from "zod";
import { ClauseContentSchema, type ClauseContent, type ClauseSeed } from "./seo-types";
import { appendFileSync, mkdirSync } from "fs";
import { join } from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `You are a senior legal content writer for Contrivox, an AI contract analysis platform. You write clear, accurate, genuinely useful explanations of contract clauses for non-lawyers — people who just received a contract and need to understand it fast.

Your writing is:
- Plain English but not dumbed down
- Specific and concrete, never vague
- Honest about what is risky versus what is standard practice
- Always qualified appropriately ("in most US jurisdictions", "consult a lawyer for your specific situation")

You never fabricate legal citations or case names. You never make absolute legal claims. You always note when enforceability varies by jurisdiction.`;

const JSON_SCHEMA = `{
  "meta_title": "string — 55-60 chars, includes clause name and intent keyword",
  "meta_description": "string — 150-160 chars, includes clause name, benefit of reading",
  "h1": "string — question format, e.g. 'What Is a Non-Compete Clause? Definition, Risks & Red Flags'",
  "intro_paragraph": "string — 80-100 words. Hook the reader immediately. What is this clause, why does it matter, and what should they watch for. No fluff.",
  "definition": {
    "plain_english": "string — 2-3 sentences a non-lawyer can understand",
    "legal_context": "string — 2-3 sentences on how this clause typically appears in contracts and what it is meant to accomplish from the drafter's perspective"
  },
  "how_it_appears": {
    "description": "string — 1-2 sentences intro",
    "example_language": "string — realistic example clause text (clearly marked as illustrative, not real legal advice)",
    "what_to_look_for": ["string", "string", "string"]
  },
  "risks_and_red_flags": [
    {
      "flag": "string — short name for the risk",
      "explanation": "string — 2-3 sentences explaining why this is risky and what it means for the signer"
    }
  ],
  "enforceability": {
    "overview": "string — 2-3 sentences on general enforceability",
    "varies_by_jurisdiction": true,
    "jurisdiction_notes": "string — 2-3 sentences noting key variations (US states, UK vs EU, etc.)"
  },
  "negotiation_tips": ["string"],
  "faqs": [
    {
      "question": "string — real question people ask",
      "answer": "string — 2-4 sentences, complete answer"
    }
  ],
  "cta_hook": "string — 1 sentence that connects this clause specifically to what Contrivox does"
}`;

function buildUserPrompt(clause: ClauseSeed, strict = false): string {
  const base = `Write complete SEO page content for this contract clause:

Clause name: ${clause.name}
Also known as: ${clause.also_known_as.join(", ")}
Category: ${clause.category}
Definition seed: ${clause.definition_seed}
Key risks to cover:
${clause.key_risks.map((r) => `- ${r}`).join("\n")}
Related clauses: ${clause.related_clause_slugs.join(", ")}

Return a JSON object with EXACTLY these fields:
${JSON_SCHEMA}

Requirements:
- risks_and_red_flags: 4-6 items
- negotiation_tips: 4-6 specific, actionable tips a non-lawyer can actually use
- faqs: 6-8 items using also_known_as variants in questions
- cta_hook must specifically mention Contrivox
- Do not fabricate case citations or case names
- Include "consult a lawyer" or equivalent qualifier somewhere in the content
- intro_paragraph must be 80-100 words`;

  return strict
    ? base + "\n\nCRITICAL: Return ONLY valid JSON. No markdown code fences. No text before or after the JSON object."
    : base + "\n\nReturn only valid JSON. No markdown, no preamble.";
}

function logGenerationError(slug: string, reason: string, detail?: unknown): void {
  const entry =
    JSON.stringify({
      timestamp: new Date().toISOString(),
      slug,
      reason,
      ...(detail != null ? { detail: String(detail) } : {}),
    }) + "\n";
  try {
    const dir = join(process.cwd(), "logs");
    mkdirSync(dir, { recursive: true });
    appendFileSync(join(dir, "generation-errors.jsonl"), entry);
  } catch {
    // Non-fatal — don't let logging failure break generation
  }
}

// Returns error strings for REJECT-level failures, warnings for WARN-level.
// Caller decides whether to throw.
function runQualityChecks(
  slug: string,
  content: ClauseContent,
  clause: ClauseSeed
): { rejects: string[]; warnings: string[] } {
  const rejects: string[] = [];
  const warnings: string[] = [];
  const fullText = JSON.stringify(content);

  // 1. Length check on intro_paragraph
  const introWords = content.intro_paragraph.trim().split(/\s+/).length;
  if (introWords < 60 || introWords > 120) {
    warnings.push(`intro_paragraph is ${introWords} words (target 60-120)`);
  }

  // 2. FAQ minimum
  if (content.faqs.length < 5) {
    rejects.push(`faqs has ${content.faqs.length} items — minimum is 5`);
  }

  // 3. Hallucination guard: fabricated case citations ("Smith v. Jones")
  if (/\b[A-Z][a-z][A-Za-z]*\s+v\.\s+[A-Z]/.test(fullText)) {
    rejects.push("possible fabricated case citation detected (pattern: Name v. Name)");
  }

  // 4. Qualifier check (warn only)
  if (!/consult a lawyer|consult an attorney|seek legal advice|jurisdiction/i.test(fullText)) {
    warnings.push('no qualifier language detected ("consult a lawyer" / "jurisdiction")');
  }

  // 5. Clause name presence
  if (!fullText.toLowerCase().includes(clause.name.toLowerCase())) {
    warnings.push(`clause name "${clause.name}" not found in generated content`);
  }

  // 6. CTA hook mentions Contrivox
  if (!/contrivox/i.test(content.cta_hook)) {
    rejects.push("cta_hook does not mention Contrivox");
  }

  return { rejects, warnings };
}

export async function generateClauseContent(clause: ClauseSeed): Promise<ClauseContent> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const prompt = buildUserPrompt(clause, attempt === 2);

    let raw: string;
    try {
      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      });
      raw = message.content
        .filter((b) => b.type === "text")
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("")
        .replace(/^```json\s*/m, "")
        .replace(/\s*```$/m, "")
        .trim();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === 2) {
        logGenerationError(clause.slug, "api_error", lastError.message);
        throw lastError;
      }
      continue;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      lastError = new Error(`JSON parse failed: ${err instanceof Error ? err.message : String(err)}`);
      if (attempt === 2) {
        logGenerationError(clause.slug, "json_parse_failed", raw.slice(0, 200));
        throw lastError;
      }
      continue;
    }

    let content: ClauseContent;
    try {
      content = ClauseContentSchema.parse(parsed);
    } catch (err) {
      const detail = err instanceof ZodError ? err.errors.map((e) => e.message).join("; ") : String(err);
      lastError = new Error(`Schema validation failed: ${detail}`);
      if (attempt === 2) {
        logGenerationError(clause.slug, "schema_validation_failed", detail);
        throw lastError;
      }
      continue;
    }

    const { rejects, warnings } = runQualityChecks(clause.slug, content, clause);

    warnings.forEach((w) => console.warn(`  ⚠  ${clause.slug}: ${w}`));

    if (rejects.length > 0) {
      rejects.forEach((r) => logGenerationError(clause.slug, `quality_reject: ${r}`));
      lastError = new Error(`Quality checks failed: ${rejects[0]}`);
      if (attempt === 2) throw lastError;
      continue;
    }

    return content;
  }

  throw lastError ?? new Error(`Failed to generate content for ${clause.slug}`);
}
