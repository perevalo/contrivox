BEGIN;

-- Extend contracts table with new zero-friction flow columns
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS session_id        text UNIQUE,
  ADD COLUMN IF NOT EXISTS file_storage_path text,
  ADD COLUMN IF NOT EXISTS file_text         text,
  ADD COLUMN IF NOT EXISTS file_type         text,
  ADD COLUMN IF NOT EXISTS media_type        text,
  ADD COLUMN IF NOT EXISTS lang_code         text NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS email             text,
  ADD COLUMN IF NOT EXISTS whatsapp          text;

CREATE INDEX IF NOT EXISTS idx_contracts_session_id
  ON public.contracts(session_id);

-- Allow webhook to link payment back to contract
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS contract_session_id text;

CREATE INDEX IF NOT EXISTS idx_payments_contract_session_id
  ON public.payments(contract_session_id);

COMMIT;
