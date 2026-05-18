BEGIN;

CREATE TABLE IF NOT EXISTS public.blog_subscribers (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash          text        NOT NULL UNIQUE,
  acquisition_source  text        NOT NULL DEFAULT 'blog-cta',
  subscribed_at       timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at     timestamptz
);

CREATE INDEX IF NOT EXISTS idx_blog_subscribers_subscribed_at
  ON public.blog_subscribers(subscribed_at DESC);

ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;

-- Only service role can access subscriber data (email hashes are PII-adjacent)
CREATE POLICY "Service role full access to blog_subscribers"
  ON public.blog_subscribers
  USING (auth.jwt() ->> 'role' = 'service_role');

COMMIT;
