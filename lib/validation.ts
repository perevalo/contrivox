import { z } from "zod";

// ─── Contract analysis output schema ─────────────────────────────────────────
export const ContrivoxAnalysisSchema = z.object({
  contract_type:          z.string().min(1).max(200),
  summary:                z.string().min(10).max(2000),
  parties:                z.array(z.string().max(200)).max(10),
  key_clauses: z.array(z.object({
    title:        z.string().max(300),
    plain_english: z.string().max(1000),
    risk_level:   z.enum(["low", "medium", "high"]),
    risk_note:    z.string().max(500).nullable(),
  })).max(30),
  red_flags: z.array(z.object({
    issue:            z.string().max(500),
    why_it_matters:   z.string().max(1000),
    challenge:        z.string().max(1000),
    challengeable:    z.boolean(),
  })).max(20),
  missing_protections:    z.array(z.string().max(500)).max(20),
  score:                  z.number().int().min(0).max(100),
  score_label:            z.enum(["Fair", "Acceptable", "Concerning", "Unfair", "Dangerous"]),
  score_reasoning:        z.string().max(1000),
  overall_recommendation: z.string().max(1500),
  disclaimer:             z.string().max(500),
});

export type ContrivoxAnalysis = z.infer<typeof ContrivoxAnalysisSchema>;

// ─── API route input schemas ──────────────────────────────────────────────────
export const analyseInputSchema = z.object({
  fileData:  z.string().max(20_000_000),          // base64, max ~15MB
  fileType:  z.enum(["image", "pdf", "text"]),
  mediaType: z.string().max(100).optional(),
  text:      z.string().max(500_000).optional(),
  langCode:  z.string().length(2),
});

export const checkoutInputSchema = z.object({
  plan:     z.enum(["single", "bundle", "pro"]),
  currency: z.enum(["usd", "brl"]).default("usd"),
  userId:   z.string().uuid().optional(),
});

export const sendReportInputSchema = z.object({
  email:      z.string().email().max(320),
  whatsapp:   z.string().max(20).optional(),
  analysis:   ContrivoxAnalysisSchema,
  pdfBase64:  z.string().max(10_000_000).optional(),
  language:   z.string().length(2),
});

// ─── Allowed MIME types for file uploads ─────────────────────────────────────
export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

export const ALLOWED_EXTENSIONS = new Set([
  "pdf", "jpg", "jpeg", "png", "gif", "webp", "txt", "doc", "docx",
]);

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
