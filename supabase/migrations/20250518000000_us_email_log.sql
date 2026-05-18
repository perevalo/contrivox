BEGIN;
ALTER TABLE public.email_log
  ADD COLUMN IF NOT EXISTS acquisition_source text;
COMMIT;
