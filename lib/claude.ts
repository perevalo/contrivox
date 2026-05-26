import Anthropic from "@anthropic-ai/sdk";
import { ZodError } from "zod";
import { ContrivoxAnalysisSchema, type ContrivoxAnalysis } from "./validation";

// Singleton — instantiated once, reused across requests
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!, // server-side only
});

export function buildContrivoxPrompt(): string {
  return `You are Contrivox, an expert US contract analyst helping everyday Americans understand legal documents. You MUST write every word of your response in English — including all JSON field values, titles, descriptions, labels, and the disclaimer. No exceptions.

PRIMARY MARKET: United States. Apply US legal standards throughout. When relevant, cite specific US legal concepts in plain language — at-will employment, NLRA rights, state non-compete enforceability, FAA arbitration, state landlord-tenant law, FLSA, etc.

score_label must be one of these exact enum values: Fair | Acceptable | Concerning | Unfair | Dangerous

US CONTRACT TYPES you will encounter:
- Employment offer letters (at-will clauses, IP assignment, non-solicitation)
- Non-compete agreements (enforceability varies by state — always flag the state)
- NDAs and confidentiality agreements (duration, scope, permitted disclosures)
- Apartment/house leases (security deposit limits, auto-renewal, habitability)
- Freelance and independent contractor agreements (IP ownership, kill fees, payment terms)
- Service agreements (limitation of liability, indemnification, governing law)
- Settlement agreements (release of claims, non-disparagement, confidentiality)
- Commercial leases (CAM charges, personal guarantee, demolition clauses)

Return ONLY a valid JSON object — no markdown fences, no preamble, no text outside the JSON:

{
  "contract_type": "string",
  "summary": "string — 3-sentence plain-language overview",
  "parties": ["string"],
  "governing_state": "US state name if identifiable, else null",
  "key_clauses": [{
    "title": "string",
    "plain_english": "string — simple explanation for a 16-year-old",
    "risk_level": "low" | "medium" | "high",
    "risk_note": "string or null",
    "us_legal_context": "relevant US law in 1 plain-language sentence, or null"
  }],
  "red_flags": [{
    "issue": "string",
    "why_it_matters": "string — real-world impact",
    "challenge": "string — exact negotiation wording",
    "challengeable": true | false,
    "urgency": "high" | "medium" | "low"
  }],
  "missing_protections": ["string"],
  "score": integer 0-100,
  "score_label": "Fair" | "Acceptable" | "Concerning" | "Unfair" | "Dangerous",
  "score_reasoning": "string — 2 sentences",
  "overall_recommendation": "string — 2-3 sentences",
  "disclaimer": "string — legal disclaimer"
}

Rules:
1. Every text value MUST be in English.
2. score < 40 for clearly one-sided contracts. score > 70 for genuinely balanced contracts.
3. challengeable = false ONLY for government-mandated clauses.
4. challenge must be a concrete negotiation script, not generic advice.
5. Plain language throughout — no legalese whatsoever.
6. NEVER include PII from the document beyond party names.
7. NEVER reproduce verbatim contract text — always paraphrase.
8. If governing_state is identifiable, tailor all advice to that state's laws.
9. For non-competes, always note the state — enforceability differs dramatically.
10. Be direct. Americans want to know: will this hurt me, how much, and what do I do?`;
}

export type FilePayload =
  | { type: "image"; data: string; mediaType: string }
  | { type: "pdf";   data: string }
  | { type: "text";  text: string };

export type ContractPreview = {
  contract_type: string;
  is_contract: boolean;
  rejected_type: string | null;
  high_risk_count: number;
  flagged_count: number;
  page_estimate: number;
};

const PREVIEW_SYSTEM = `You are a contract classifier. Return ONLY a valid JSON object — no markdown, no preamble, nothing else.`;

export async function previewContract(payload: FilePayload): Promise<ContractPreview> {
  let userContent: Anthropic.MessageParam["content"];

  const classifyPrompt = `Scan this document and return ONLY this JSON:
{"contract_type":"type in plain English e.g. Employment Agreement","is_contract":true,"rejected_type":null,"high_risk_count":0,"flagged_count":0,"page_estimate":1}

Rules:
- Set is_contract=true ONLY if the document is one of: employment agreement, NDA, non-disclosure agreement, lease, rental agreement, tenancy agreement, freelance contract, independent contractor agreement, service agreement, business contract, vendor agreement, settlement agreement, commercial lease.
- Set is_contract=false and set rejected_type to the document's PURPOSE or content type — never its file format. Good examples: "Resume/CV", "Invoice", "Academic Paper", "Medical Record", "Cover Letter", "Bank Statement", "News Article", "Receipt", "Report". Bad examples (never use these): "Word Document", "PDF", "Spreadsheet", "Text File", "Binary File".
- If the document content is unreadable, garbled, or appears to be binary/encoded data, set is_contract=false and rejected_type="Unreadable file".
- high_risk_count: count of non-competes + mandatory arbitration + broad IP assignment + clawback + unilateral modification clauses (integer 0-20).
- flagged_count: count of other clauses worth reviewing (integer 0-20).
- page_estimate: estimated number of pages (integer 1-50).`;

  if (payload.type === "image") {
    userContent = [
      { type: "image", source: { type: "base64", media_type: payload.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp", data: payload.data } },
      { type: "text", text: classifyPrompt },
    ];
  } else if (payload.type === "pdf") {
    userContent = [
      { type: "document", source: { type: "base64", media_type: "application/pdf", data: payload.data } },
      { type: "text", text: classifyPrompt },
    ];
  } else {
    userContent = `${classifyPrompt}\n\nDocument:\n${payload.text.slice(0, 60000)}`;
  }

  // PDFs need sonnet — haiku misreads them and returns error strings as contract_type
  const model = payload.type === "pdf" ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001";

  try {
    const message = await client.messages.create({
      model,
      max_tokens: 256,
      system: PREVIEW_SYSTEM,
      messages: [{ role: "user", content: userContent }],
    });

    const raw = message.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .replace(/```json\n?|\n?```/g, "")
      .trim();

    const parsed = JSON.parse(raw);

    const rawType = String(parsed.contract_type || "").toLowerCase();
    const badType = /unable|cannot|corrupt|encrypt|error|unknown|n\/a|not (a |be |determine)/i.test(rawType);
    const contract_type = badType || !rawType ? "Contract" : String(parsed.contract_type).slice(0, 200);

    const is_contract = parsed.is_contract === false ? false : true;
    const rawRejected = String(parsed.rejected_type || "").slice(0, 100).trim();
    // Sanitize: if the model returned a file format name instead of a content type, replace it
    const isFormatName = /^(word\s*(doc(ument)?)?|pdf(\s*file)?|excel|spreadsheet|powerpoint|text\s*file|image(\s*file)?|binary|docx?|xlsx?|pptx?|csv|document\s*file)$/i.test(rawRejected);
    const rejected_type = is_contract
      ? null
      : (isFormatName || !rawRejected ? "Unreadable file" : rawRejected);

    return {
      contract_type,
      is_contract,
      rejected_type,
      high_risk_count: Math.max(0, Math.min(20, parseInt(String(parsed.high_risk_count)) || 0)),
      flagged_count:   Math.max(0, Math.min(20, parseInt(String(parsed.flagged_count))   || 0)),
      page_estimate:   Math.max(1, Math.min(50, parseInt(String(parsed.page_estimate))   || 1)),
    };
  } catch (err) {
    console.error("[previewContract] error:", err instanceof Error ? err.message : String(err));
    return { contract_type: "Contract", is_contract: true, rejected_type: null, high_risk_count: 0, flagged_count: 0, page_estimate: 1 };
  }
}

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
  payload: FilePayload
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
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: buildContrivoxPrompt(),
      messages: [{ role: "user", content: userContent }],
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
    if (err instanceof SyntaxError || err instanceof ZodError) throw new AppError("parse_error", 502);
    throw new AppError("unknown", 500);
  }
}
