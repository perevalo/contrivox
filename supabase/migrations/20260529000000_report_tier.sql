BEGIN;

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS report_tier text NOT NULL DEFAULT 'basic'
    CHECK (report_tier IN ('basic', 'full'));

CREATE INDEX IF NOT EXISTS idx_contracts_report_tier
  ON public.contracts(report_tier);

-- Allow 0 credits for upgrade payments (no new analysis credit granted)
ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_credits_granted_check;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_credits_granted_check
  CHECK (credits_granted >= 0);

COMMIT;
