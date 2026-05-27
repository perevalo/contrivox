-- Allow zero-amount payments (100% coupon codes via Stripe)
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_amount_cents_check;

ALTER TABLE payments
  ADD CONSTRAINT payments_amount_cents_check
  CHECK (amount_cents >= 0);
