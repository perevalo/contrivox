import { z } from "zod";

// ─── Generated page content schema ──────────────────────────────────────────
// This is what Claude returns for each clause page.

export const ClauseContentSchema = z.object({
  meta_title:       z.string().min(1),
  meta_description: z.string().min(1),
  h1:               z.string().min(1),
  intro_paragraph:  z.string().min(1),

  definition: z.object({
    plain_english: z.string().min(1),
    legal_context: z.string().min(1),
  }),

  how_it_appears: z.object({
    description:       z.string().min(1),
    example_language:  z.string().min(1),
    what_to_look_for:  z.array(z.string()).min(1),
  }),

  risks_and_red_flags: z.array(
    z.object({
      flag:        z.string().min(1),
      explanation: z.string().min(1),
    })
  ).min(1),

  enforceability: z.object({
    overview:                 z.string().min(1),
    varies_by_jurisdiction:   z.boolean(),
    jurisdiction_notes:       z.string().min(1),
  }),

  negotiation_tips: z.array(z.string()).min(1),

  faqs: z.array(
    z.object({
      question: z.string().min(1),
      answer:   z.string().min(1),
    })
  ).min(1),

  cta_hook: z.string().min(1),
});

export type ClauseContent = z.infer<typeof ClauseContentSchema>;

// ─── Database row schemas ────────────────────────────────────────────────────

export const ClauseRowSchema = z.object({
  id:                   z.string().uuid(),
  slug:                 z.string(),
  name:                 z.string(),
  also_known_as:        z.array(z.string()),
  category:             z.enum(["employment", "freelance", "commercial", "ip", "general"]).nullable(),
  search_volume_tier:   z.enum(["high", "medium", "low"]).nullable(),
  definition_seed:      z.string().nullable(),
  key_risks:            z.array(z.string()),
  related_clause_slugs: z.array(z.string()),
  jurisdictions:        z.array(z.string()),
  generated_content:    ClauseContentSchema.nullable(),
  content_reviewed:     z.boolean(),
  published:            z.boolean(),
  generated_at:         z.string().nullable(),
  created_at:           z.string(),
});

export type ClauseRow = z.infer<typeof ClauseRowSchema>;

export const SeoContractRowSchema = z.object({
  id:                uuid(),
  slug:              z.string(),
  name:              z.string(),
  category:          z.string().nullable(),
  clause_slugs:      z.array(z.string()),
  generated_content: z.unknown().nullable(),
  published:         z.boolean(),
  created_at:        z.string(),
});

export type SeoContractRow = z.infer<typeof SeoContractRowSchema>;

export const JurisdictionRowSchema = z.object({
  id:               uuid(),
  slug:             z.string(),
  country:          z.string(),
  region:           z.string().nullable(),
  clause_overrides: z.record(z.unknown()),
  published:        z.boolean(),
  created_at:       z.string(),
});

export type JurisdictionRow = z.infer<typeof JurisdictionRowSchema>;

// ─── Jurisdiction page content (AI-generated, per clause+jurisdiction) ────────

export const JurisdictionContentSchema = z.object({
  meta_title:       z.string().min(1),
  meta_description: z.string().min(1),
  h1:               z.string().min(1),
  intro_paragraph:  z.string().min(1),

  enforceability: z.object({
    verdict:       z.enum(["enforceable", "limited", "unenforceable", "varies"]),
    verdict_label: z.string().min(1),
    explanation:   z.string().min(1),
  }),

  key_rules: z.array(
    z.object({ rule: z.string().min(1), detail: z.string().min(1) })
  ).min(1),

  recent_changes:   z.string().nullable(),
  how_it_differs:   z.string().min(1),
  negotiation_tips: z.array(z.string()).min(1),

  faqs: z.array(
    z.object({ question: z.string().min(1), answer: z.string().min(1) })
  ).min(1),

  cta_hook: z.string().min(1),
});

export type JurisdictionContent = z.infer<typeof JurisdictionContentSchema>;

export const JurisdictionPageRowSchema = z.object({
  id:                z.string().uuid(),
  clause_slug:       z.string(),
  jurisdiction_slug: z.string(),
  jurisdiction_name: z.string(),
  generated_content: JurisdictionContentSchema.nullable(),
  published:         z.boolean(),
  generated_at:      z.string().nullable(),
  created_at:        z.string(),
});

export type JurisdictionPageRow = z.infer<typeof JurisdictionPageRowSchema>;

export type JurisdictionSeed = {
  clause_slug:       string;
  jurisdiction_slug: string;
  jurisdiction_name: string;
};

// ─── Seed data type (subset of ClauseRow, no DB-generated fields) ────────────

export type ClauseSeed = {
  slug:                 string;
  name:                 string;
  also_known_as:        string[];
  category:             ClauseRow["category"];
  search_volume_tier:   ClauseRow["search_volume_tier"];
  definition_seed:      string | null;
  key_risks:            string[];
  related_clause_slugs: string[];
  jurisdictions:        string[];
};

function uuid() {
  return z.string().uuid();
}
