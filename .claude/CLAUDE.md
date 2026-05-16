# CLAUDE.md — Contrivox Agent Constitution
# Loaded on every session. Do not delete or shorten.
# Last updated: 2025-05

---

## 🏛️ WHO YOU ARE

You are the Contrivox engineering agent. Contrivox is a multilingual AI-powered
contract analysis SaaS. Your job is to build, maintain, and improve it — safely,
correctly, and with production-quality code every time.

**Stack**: Next.js 14 (App Router) · TypeScript · Supabase (auth + DB + storage)
· Stripe (payments) · Claude API (Sonnet) · Resend (email) · jsPDF (client PDF)
· Vercel (hosting) · Upstash Redis (rate limiting)

**Languages supported**: EN · PT-BR · ES · FR · DE · IT · UK · PL · AR · ZH · JA · RU

---

## 🔐 SECURITY — ABSOLUTE RULES (never break these)

### API Keys & Secrets
- NEVER hardcode API keys, tokens, passwords, or secrets anywhere in source code
- NEVER log secrets, even in debug mode
- NEVER commit `.env` files — always use `.env.example` with placeholder values
- ALL secrets live in environment variables: `process.env.XXX`
- Anthropic API key NEVER touches the client bundle — server-side only
- Stripe secret key NEVER touches the client bundle — server-side only

### Input Validation
- ALWAYS validate and sanitize every user input server-side (never trust client)
- Use `zod` for all API route input validation — no raw `req.json()` without schema
- File uploads: validate MIME type server-side (not just extension), max 20MB hard limit
- Reject files with MIME types not in allowlist: pdf, png, jpg, jpeg, gif, webp, txt, docx
- Strip all HTML from text inputs before processing

### Authentication & Authorization
- Every protected API route MUST verify the Supabase session token
- Use `createServerClient` from `@supabase/ssr` — never the anon client on server
- Row Level Security (RLS) MUST be enabled on ALL Supabase tables
- Users can only read/write their own rows — enforced at DB level, not just app level
- Stripe webhook MUST verify signature with `stripe.webhooks.constructEvent`

### Rate Limiting
- ALL public API routes rate-limited via Upstash Redis
- `/api/analyse`: 5 requests per IP per hour (free tier protection)
- `/api/checkout`: 10 per IP per hour
- `/api/send-report`: 20 per IP per hour
- Return 429 with `Retry-After` header on breach

### Content Security
- Claude API calls MUST include a system prompt that prohibits PII extraction
- Never pass raw user data to Claude without the safety system prompt prepended
- Contract text is processed in-memory — never persisted unless user is authenticated
  and has explicitly consented
- PDF generation is client-side — contract content never hits our servers for PDF

### Transport & Headers
- Enforce HTTPS everywhere — no HTTP fallback
- Set security headers via `next.config.js`:
  - `Content-Security-Policy`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- CORS: only allow `contrivox.com` and `localhost` origins

### Database Security
- NEVER use `select *` — always specify columns explicitly
- NEVER build SQL strings with string concatenation — use parameterized queries
- All DB operations go through Supabase client (parameterized), never raw SQL from user input
- Sensitive columns (email) encrypted at rest via Supabase Vault

---

## 📁 PROJECT STRUCTURE

```
contrivox/
├── .claude/
│   └── CLAUDE.md              ← this file
├── app/
│   ├── api/
│   │   ├── analyse/route.ts   ← Claude analysis endpoint
│   │   ├── checkout/route.ts  ← Stripe checkout session
│   │   ├── webhook/route.ts   ← Stripe webhook handler
│   │   └── send-report/route.ts ← Resend email delivery
│   ├── [lang]/                ← i18n routing (en, pt, es)
│   └── layout.tsx
├── components/                ← React components
├── lib/
│   ├── claude.ts              ← Claude API wrapper
│   ├── stripe.ts              ← Stripe singleton
│   ├── supabase/
│   │   ├── client.ts          ← browser client
│   │   └── server.ts          ← server client (SSR)
│   ├── rate-limit.ts          ← Upstash Redis rate limiter
│   ├── validation.ts          ← Zod schemas
│   └── pdf.ts                 ← jsPDF generator
├── skills/                    ← Claude Code skills
├── hooks/                     ← Claude Code hooks
├── subagents/                 ← Claude Code subagents
├── plugin/                    ← Claude Code plugin manifest
├── supabase/
│   └── migrations/            ← SQL migrations (versioned)
├── .env.example               ← template (no real values)
└── next.config.js
```

---

## 🧱 CODE CONVENTIONS

### TypeScript
- Strict mode ON (`"strict": true` in tsconfig)
- No `any` — use `unknown` and narrow properly
- All API responses typed with Zod schemas
- Use `satisfies` operator for config objects

### API Routes
```typescript
// Every route follows this pattern:
import { withRateLimit } from "@/lib/rate-limit";
import { withAuth } from "@/lib/auth";          // if protected
import { schema } from "@/lib/validation";

export const POST = withRateLimit(withAuth(async (req, { user }) => {
  const body = schema.parse(await req.json());  // throws on invalid
  // ... implementation
}));
```

### Error handling
- Never expose stack traces or internal errors to client
- Map all errors to user-safe messages
- Log full errors server-side with request ID
- HTTP status codes must be semantically correct

### Naming
- Files: `kebab-case.ts`
- Components: `PascalCase.tsx`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- DB columns: `snake_case`
- ENV vars: `UPPER_SNAKE_CASE` with `NEXT_PUBLIC_` prefix for client-safe only

### Imports
- Absolute imports via `@/` alias — never relative `../../`
- Group: React → Next → External → Internal → Types
- No barrel exports from `lib/` (causes bundle bloat)

---

## 🚫 ANTI-PATTERNS — NEVER DO THESE

| Anti-pattern | Why | Instead |
|---|---|---|
| `console.log` in production | Leaks data | Use structured logger with levels |
| `dangerouslySetInnerHTML` | XSS | Use React rendering |
| `eval()` or `new Function()` | Code injection | Never |
| Raw `fetch` to Claude from client | Exposes API key | Server route only |
| `select *` from DB | Over-fetches, leaks schema | Name columns |
| Catch-all `try/catch` that swallows errors | Silent failures | Re-throw or handle specifically |
| `localStorage` for auth tokens | XSS vulnerable | httpOnly cookies via Supabase |
| Unvalidated file MIME type | Upload attacks | Server-side MIME check |
| Hardcoded user IDs or emails | Privilege escalation | Always from session |
| `process.env` on client components | Secret exposure | Only `NEXT_PUBLIC_` on client |

---

## 🗃️ DATABASE SCHEMA (reference)

```sql
-- Always check supabase/migrations/ for latest version

users          id, email, name, preferred_language, credit_balance,
               stripe_customer_id, created_at
contracts      id, user_id (nullable for guests), file_name, storage_path,
               extracted_text_hash, language, analysis (jsonb), status,
               ip_hash, created_at
payments       id, user_id, stripe_session_id (unique), stripe_customer_id,
               amount_cents, credits_granted, created_at
email_log      id, email_hash, contract_id, sent_at, status
```

---

## 🧪 TESTING REQUIREMENTS

- Unit tests for: all validation schemas, rate limiter, prompt builder
- Integration tests for: API routes (mocked Stripe + Supabase)
- Never test against production DB — use Supabase local dev
- Test file naming: `*.test.ts` colocated with source
- Run `pnpm test` before any PR

---

## 🚀 DEPLOYMENT CHECKLIST

Before any production deploy, verify:
- [ ] No `console.log` in changed files
- [ ] All new env vars added to Vercel dashboard AND `.env.example`
- [ ] DB migrations applied to production (`supabase db push`)
- [ ] RLS policies verified for any new tables
- [ ] Rate limits tested
- [ ] Stripe webhook secret rotated if touched
- [ ] `pnpm build` passes with zero TypeScript errors

---

## 🌐 LOCALIZATION RULES

- UI language detected from browser, stored in `localStorage` as `cvx_ui_lang`
- Output language is user's explicit choice, stored per-analysis
- ALL Claude prompts explicitly instruct response language — never assume
- `score_label` field stays as English enum internally (used for color mapping)
- Prices shown in local currency: USD for EN/default, BRL for PT, local for ES
- PIX payment method enabled for Brazilian users (detected by language = pt)

---

## 📦 DEPENDENCIES — APPROVED LIST

| Package | Purpose | Notes |
|---|---|---|
| `@supabase/ssr` | Auth + DB | Use server client in routes |
| `@supabase/supabase-js` | DB client | Browser client in components |
| `stripe` | Payments | Server only |
| `resend` | Email | Server only |
| `zod` | Validation | ALL inputs |
| `@upstash/ratelimit` | Rate limiting | All public routes |
| `@upstash/redis` | Redis client | Used by rate limiter |
| `jspdf` | PDF generation | Client-side only |
| `next-intl` | i18n | Routing + translations |

**Adding a new dependency requires**: security audit, bundle impact check, team approval.

---

## 🤖 CLAUDE API USAGE RULES

- Model: `claude-sonnet-4-20250514` (never use haiku for contract analysis)
- Max tokens: 4096 (analysis), 1000 (summaries)
- Temperature: not set (default) — we want deterministic legal analysis
- System prompt: ALWAYS include the full safety + language instruction prompt
- NEVER stream to client directly — buffer server-side, validate JSON, then respond
- ALWAYS handle: network errors, JSON parse errors, API rate limits (429), overload (529)
- Log token usage per request for cost tracking

---

*This file is the source of truth. When in doubt, re-read this file.*
