-- Migration: 20250516000000_initial_schema.sql
-- Description: Contrivox initial database schema
-- Rollback: DROP TABLE email_log, payments, contracts, users CASCADE;

BEGIN;

-- ── Users (extends Supabase auth.users) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id                  uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               text        NOT NULL,
  name                text,
  preferred_language  text        NOT NULL DEFAULT 'en',
  credit_balance      integer     NOT NULL DEFAULT 0 CHECK (credit_balance >= 0),
  stripe_customer_id  text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email            ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer  ON public.users(stripe_customer_id);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role full access to users"
  ON public.users USING (auth.jwt() ->> 'role' = 'service_role');

-- ── Contracts ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contracts (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  file_name             text,
  storage_path          text,
  extracted_text_hash   text,                     -- SHA-256 of original text (for dedup)
  language              text        NOT NULL DEFAULT 'en',
  analysis              jsonb,
  status                text        NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending', 'done', 'error')),
  ip_hash               text,                     -- hashed IP for abuse tracking
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contracts_user_id    ON public.contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON public.contracts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contracts_status     ON public.contracts(status);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own contracts"
  ON public.contracts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own contracts"
  ON public.contracts FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users update own contracts"
  ON public.contracts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to contracts"
  ON public.contracts USING (auth.jwt() ->> 'role' = 'service_role');

-- ── Payments ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  stripe_session_id   text        NOT NULL UNIQUE,  -- unique prevents double-grant
  stripe_customer_id  text,
  amount_cents        integer     NOT NULL CHECK (amount_cents > 0),
  credits_granted     integer     NOT NULL CHECK (credits_granted > 0),
  plan                text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id          ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session   ON public.payments(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_customer  ON public.payments(stripe_customer_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own payments"
  ON public.payments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to payments"
  ON public.payments USING (auth.jwt() ->> 'role' = 'service_role');

-- ── Email log (hashed email only — no PII) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_log (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash  text        NOT NULL,   -- SHA-256(lowercase email)
  resend_id   text,
  contract_id uuid        REFERENCES public.contracts(id) ON DELETE SET NULL,
  status      text        NOT NULL DEFAULT 'sent',
  language    text,
  sent_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_log_email_hash ON public.email_log(email_hash);
CREATE INDEX IF NOT EXISTS idx_email_log_sent_at    ON public.email_log(sent_at DESC);

ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

-- Email log is write-only from app — readable only by service role
CREATE POLICY "Service role full access to email_log"
  ON public.email_log USING (auth.jwt() ->> 'role' = 'service_role');

-- ── Atomic credit functions ────────────────────────────────────────────────────

-- Grant credits (called from Stripe webhook via service role)
CREATE OR REPLACE FUNCTION public.add_credits(uid uuid, amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
  SET    credit_balance = credit_balance + amount,
         updated_at     = now()
  WHERE  id = uid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'user_not_found';
  END IF;
END;
$$;

-- Deduct one credit (called before each analysis)
CREATE OR REPLACE FUNCTION public.deduct_credit(uid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
  SET    credit_balance = credit_balance - 1,
         updated_at     = now()
  WHERE  id = uid
  AND    credit_balance > 0;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'no_credits';
  END IF;
END;
$$;

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger: runs on every new Supabase auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;
