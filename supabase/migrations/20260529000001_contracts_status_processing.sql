-- Add 'processing' to the contracts status check constraint.
-- The webhook uses status='processing' as an atomic idempotency lock
-- but the original constraint only allowed pending/done/error.

ALTER TABLE public.contracts
  DROP CONSTRAINT IF EXISTS contracts_status_check;

ALTER TABLE public.contracts
  ADD CONSTRAINT contracts_status_check
  CHECK (status IN ('pending', 'processing', 'done', 'error'));
