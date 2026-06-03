-- ============================================================
-- Migration: jurisdiction_language_detection
-- Adds jurisdiction and language detection columns to contracts.
-- STATUS: requires manual apply (supabase db push or SQL editor)
-- ============================================================

BEGIN;

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS jurisdiction_code    text,
  ADD COLUMN IF NOT EXISTS jurisdiction_name    text,
  ADD COLUMN IF NOT EXISTS detection_confidence float,
  ADD COLUMN IF NOT EXISTS detection_signals    text[],
  ADD COLUMN IF NOT EXISTS document_language    text,
  ADD COLUMN IF NOT EXISTS language_code        text,
  ADD COLUMN IF NOT EXISTS language_confidence  float;

CREATE INDEX IF NOT EXISTS idx_contracts_jurisdiction_code
  ON public.contracts(jurisdiction_code);

CREATE INDEX IF NOT EXISTS idx_contracts_language_code
  ON public.contracts(language_code);

COMMENT ON COLUMN public.contracts.jurisdiction_code    IS 'Detected jurisdiction code, e.g. US-CA, UK, CA-ON';
COMMENT ON COLUMN public.contracts.jurisdiction_name    IS 'Human-readable jurisdiction name';
COMMENT ON COLUMN public.contracts.detection_confidence IS 'Jurisdiction detection confidence 0.0–1.0 (1.0 = user confirmed)';
COMMENT ON COLUMN public.contracts.detection_signals    IS 'Signal descriptions that drove detection; [''user_confirmed''] if manually set';
COMMENT ON COLUMN public.contracts.document_language    IS 'Detected document language display name, e.g. English, Spanish';
COMMENT ON COLUMN public.contracts.language_code        IS 'BCP-47 language code, e.g. en, es, fr';
COMMENT ON COLUMN public.contracts.language_confidence  IS 'Language detection confidence 0.0–1.0';

COMMIT;
