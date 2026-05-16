# Contrivox

**Your contract. Decoded.**

Multilingual AI-powered contract analyser. Upload any contract in any format and any language — get a plain-English breakdown, red flags, fairness score, negotiation scripts, and a branded PDF report delivered to your email and WhatsApp.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) · React · TypeScript |
| AI | Claude Sonnet 4 (Anthropic API) |
| Auth + DB | Supabase (Postgres + Row Level Security) |
| Payments | Stripe (one-time · no subscription) |
| Email | Resend |
| Rate limiting | Upstash Redis |
| Hosting | Vercel |
| PDF | jsPDF (client-side) |

---

## Prerequisites — install these first

Open **PowerShell as Administrator** and run each block:

### 1. Install Node.js (v20 LTS)
```powershell
winget install OpenJS.NodeJS.LTS
# Restart PowerShell after this
node --version   # should print v20.x.x
```

### 2. Install pnpm
```powershell
npm install -g pnpm
pnpm --version
```

### 3. Install Git
```powershell
winget install Git.Git
# Restart PowerShell after this
git --version
```

### 4. Install Supabase CLI
```powershell
winget install Supabase.CLI
supabase --version
```

### 5. Install Stripe CLI (for local webhook testing)
```powershell
winget install Stripe.StripeCLI
stripe --version
```

---

## First-time setup — step by step in PowerShell

### Step 1 — Clone the repo
```powershell
git clone https://github.com/YOUR_USERNAME/contrivox.git
cd contrivox
```

### Step 2 — Install dependencies
```powershell
pnpm install
```

### Step 3 — Create your environment file
```powershell
Copy-Item .env.example .env.local
```
Now open `.env.local` in your editor and fill in every value (see **Environment variables** section below).

### Step 4 — Start Supabase locally
```powershell
supabase start
```
This starts a local Postgres instance. Copy the output values into your `.env.local`:
- `API URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

### Step 5 — Run database migrations
```powershell
supabase db push
```

### Step 6 — Start the Stripe webhook listener (separate terminal)
```powershell
stripe listen --forward-to localhost:3000/api/webhook
```
Copy the **webhook signing secret** it prints (`whsec_...`) into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### Step 7 — Start the development server
```powershell
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — Contrivox is running.

---

## Environment variables

Open `.env.local` and fill in these values. Get them from each service's dashboard.

```env
# ── Supabase (from: supabase start output or app.supabase.com) ────────────────
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ── Anthropic (from: console.anthropic.com/api-keys) ─────────────────────────
ANTHROPIC_API_KEY=sk-ant-...

# ── Stripe (from: dashboard.stripe.com/apikeys) ───────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (from: dashboard.stripe.com/products → create 5 products)
STRIPE_PRICE_SINGLE_USD=price_...   # $3.99
STRIPE_PRICE_BUNDLE_USD=price_...   # $14.99
STRIPE_PRICE_PRO_USD=price_...      # $39.99
STRIPE_PRICE_SINGLE_BRL=price_...   # R$19,90
STRIPE_PRICE_BUNDLE_BRL=price_...   # R$49,90

# ── Resend (from: resend.com/api-keys) ────────────────────────────────────────
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=reports@contrivox.com

# ── Upstash Redis (from: console.upstash.com) ─────────────────────────────────
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# ── App ───────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=XXXXXXXXXXXXXXXXX
```

---

## Stripe products setup

In [Stripe Dashboard → Products](https://dashboard.stripe.com/test/products), create **5 products**:

| Product name | Price | Currency | Copy Price ID to |
|---|---|---|---|
| Contrivox Single Analysis | $3.99 | USD | `STRIPE_PRICE_SINGLE_USD` |
| Contrivox Bundle (5) | $14.99 | USD | `STRIPE_PRICE_BUNDLE_USD` |
| Contrivox Pro (20) | $39.99 | USD | `STRIPE_PRICE_PRO_USD` |
| Contrivox Análise Única | R$19,90 | BRL | `STRIPE_PRICE_SINGLE_BRL` |
| Contrivox Pacote (5) | R$49,90 | BRL | `STRIPE_PRICE_BUNDLE_BRL` |

Set all to **one-time payment** (not recurring).

---

## Deploying to production (Vercel)

### Step 1 — Push to GitHub
```powershell
git add .
git commit -m "Initial Contrivox setup"
git push origin main
```

### Step 2 — Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Add all environment variables from `.env.local` (replace local values with production ones)
5. Click **Deploy**

### Step 3 — Set production Supabase
1. Create project at [app.supabase.com](https://app.supabase.com)
2. Go to **SQL Editor** → paste contents of `supabase/migrations/20250516000000_initial_schema.sql` → Run
3. Copy connection credentials to Vercel env vars

### Step 4 — Set production Stripe webhook
```powershell
# After deploying, register the production webhook:
stripe listen --forward-to https://contrivox.com/api/webhook
# Or add it manually in Stripe Dashboard → Webhooks → Add endpoint
# URL: https://contrivox.com/api/webhook
# Events: checkout.session.completed
```

### Step 5 — Verify deployment
```powershell
# Check your live site
Start-Process "https://contrivox.com"
```

---

## Available commands

```powershell
pnpm dev          # Start development server (localhost:3000)
pnpm build        # Build for production
pnpm start        # Start production server locally
pnpm typecheck    # Check TypeScript errors
pnpm lint         # Run ESLint
pnpm test         # Run tests
pnpm db:push      # Apply migrations to local Supabase
pnpm db:reset     # Reset local database (destructive)
pnpm db:types     # Regenerate TypeScript types from schema
```

---

## Project structure

```
contrivox/
├── app/
│   ├── api/
│   │   ├── analyse/route.ts        ← Claude analysis (rate limited, validated)
│   │   ├── checkout/route.ts       ← Stripe checkout session creator
│   │   ├── webhook/route.ts        ← Stripe webhook handler
│   │   └── send-report/route.ts    ← Resend email delivery
│   ├── layout.tsx                  ← Root layout + metadata
│   ├── page.tsx                    ← Home page
│   └── globals.css
├── components/
│   └── Contrivox.jsx               ← Main application component
├── lib/
│   ├── claude.ts                   ← Claude API wrapper + prompt builder
│   ├── email.ts                    ← Resend integration + HTML template
│   ├── rate-limit.ts               ← Upstash rate limiter
│   ├── stripe.ts                   ← Stripe singleton + plan config
│   ├── validation.ts               ← Zod schemas for all inputs
│   └── supabase/
│       ├── client.ts               ← Browser Supabase client
│       └── server.ts               ← Server Supabase client (SSR)
├── supabase/
│   └── migrations/
│       └── 20250516000000_initial_schema.sql
├── types/
│   └── supabase.ts                 ← Generated DB types
├── .claude/
│   ├── CLAUDE.md                   ← Agent constitution (security + conventions)
│   └── settings.json               ← Hook configuration
├── skills/                         ← Claude Code skills
├── subagents/                      ← Claude Code subagents
├── hooks/                          ← Pre/post tool-use security hooks
├── plugin/plugin.json              ← Claude Code plugin manifest
├── middleware.ts                   ← Supabase session refresh
├── next.config.js                  ← Security headers + config
├── .env.example                    ← Environment template
└── .gitignore
```

---

## Security

- All API routes are rate-limited via Upstash Redis
- All inputs validated with Zod before processing
- Claude API key never exposed to client
- Stripe webhook signature verified on every call
- Supabase Row Level Security enabled on all tables
- Email addresses stored only as SHA-256 hashes in logs
- Security headers on every response (CSP, X-Frame-Options, HSTS, etc.)
- File uploads validated server-side for MIME type and size

---

## Support

Open an issue on GitHub or email support@contrivox.com.

*Contrivox is not a law firm and does not provide legal advice.*
