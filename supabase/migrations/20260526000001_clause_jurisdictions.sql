-- Jurisdiction-specific clause pages: /clauses/[slug]/[jurisdiction]
-- Run in Supabase dashboard → SQL Editor (idempotent)

CREATE TABLE IF NOT EXISTS clause_jurisdictions (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  clause_slug       text        NOT NULL,
  jurisdiction_slug text        NOT NULL,
  jurisdiction_name text        NOT NULL,
  generated_content jsonb,
  published         boolean     NOT NULL DEFAULT false,
  generated_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT clause_jurisdictions_unique UNIQUE (clause_slug, jurisdiction_slug)
);

ALTER TABLE clause_jurisdictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published jurisdiction pages" ON clause_jurisdictions;
CREATE POLICY "Public read published jurisdiction pages"
  ON clause_jurisdictions FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Service role full access to clause_jurisdictions" ON clause_jurisdictions;
CREATE POLICY "Service role full access to clause_jurisdictions"
  ON clause_jurisdictions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_cj_clause_slug       ON clause_jurisdictions (clause_slug);
CREATE INDEX IF NOT EXISTS idx_cj_jurisdiction_slug ON clause_jurisdictions (jurisdiction_slug);
CREATE INDEX IF NOT EXISTS idx_cj_published         ON clause_jurisdictions (published) WHERE published = true;
