# Plan 01 — Report Upgrade Upsell ($9 Basic → $15 Upgrade → Full Report)

Generated: 2026-05-29  
Status: Ready to execute

---

## Phase 0 — Documentation Discovery (Completed)

All source files were read before this plan was written. Key facts:

### Confirmed API shapes

**`ContrivoxAnalysisSchema`** (`lib/validation.ts:4-29`)
- `key_clauses[]` — `{title, plain_english, risk_level, risk_note, us_legal_context}`  — up to 30
- `red_flags[]` — `{issue, why_it_matters, challenge, challengeable, urgency}` — up to 20
- `missing_protections[]` — string array — up to 20
- `score` (0–100), `score_label`, `score_reasoning`, `overall_recommendation`

**`PLANS`** (`lib/stripe.ts:9-24`)
- `basic_usd` → `priceId: STRIPE_PRICE_BASIC_USD`, tier `"basic"`, $9
- `pro_usd`   → `priceId: STRIPE_PRICE_PRO_USD`,   tier `"pro"`,   $29
- `PlanTier = "basic" | "pro"` — needs `"full"` added or mapped

**`checkoutInputSchema`** (`lib/validation.ts:41-45`)
- `plan: z.enum(["basic", "pro"])` — needs `"upgrade"` added

**Webhook** (`app/api/webhook/route.ts:32-96`)
- `checkout.session.completed` → upserts payment, derives tier, calls `triggerRealAnalysis`
- `triggerRealAnalysis` (`lines 102-199`) — runs Claude, saves `{analysis, status:"done"}`, emails PDF for pro
- Does NOT currently write `report_tier` to contracts

**Status API** (`app/api/contract/status/route.ts`)
- `GET /api/contract/status?stripe_session=X`
- Joins `payments → contracts` via `contract_session_id`
- Returns `{status, analysis}` — does NOT return `report_tier` or `contract_session_id`

**`SuccessContent.tsx`** (`app/success/SuccessContent.tsx`)
- Reads tier from `?plan=basic|pro` URL param (line 403)
- Passes `tier` as prop to `InlineReport`
- Sticky bar currently shows "Analyse Another" when report is ready

**`InlineReport`** (`app/success/SuccessContent.tsx:224`)
- Negotiation scripts already gated: `{tier === "pro" && flag.challengeable && ...}` (line 301)
- Everything else (clause details, red flags, missing protections) shown for ALL tiers
- Basic upsell banner at lines 645-654 links back to `/` — needs upgrade checkout instead

**DB schema** (from migrations)
- `contracts` table: `id, session_id (unique), analysis (jsonb), status`
- NO `report_tier` column yet
- `payments` table: `stripe_session_id, contract_session_id, plan`

### Anti-patterns to avoid
- Do not use `?plan=pro` URL param as the sole gating signal — trivially spoofable
- Do not re-run Claude analysis on upgrade — use the stored `analysis` jsonb
- Do not add `report_tier` logic to the client-side `PreviewCard` — that's pre-payment
- Do not break existing $29 pro flow — it must still work unchanged

---

## Phase 1 — Database Migration + Stripe Config

**Goal**: Add `report_tier` column, a new Stripe upgrade price, and extend the PLANS object.

### 1.1 — DB Migration

Create `supabase/migrations/20260529000000_report_tier.sql`:

```sql
BEGIN;

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS report_tier text NOT NULL DEFAULT 'basic'
    CHECK (report_tier IN ('basic', 'full'));

CREATE INDEX IF NOT EXISTS idx_contracts_report_tier
  ON public.contracts(report_tier);

COMMIT;
```

Pattern: copy the `ADD COLUMN IF NOT EXISTS` pattern from
`supabase/migrations/20250519000000_contract_session.sql:4-12`.

### 1.2 — Environment Variable

Add to `.env.example`:
```
STRIPE_PRICE_UPGRADE_USD=price_xxxx
```
(Create the actual $15 price in your Stripe dashboard, then set the real value in Vercel.)

### 1.3 — `lib/stripe.ts` — Add upgrade plan

Copy the existing `pro_usd` block pattern and add:
```typescript
upgrade_usd: {
  priceId: process.env.STRIPE_PRICE_UPGRADE_USD!,
  credits: 0,       // no new credit — access upgrade only
  amount:  1500,
  label:   "Report Upgrade",
  tier:    "full" as const,
},
```
Also extend `PlanTier`:
```typescript
export type PlanTier = "basic" | "pro" | "full";
```

### 1.4 — `lib/validation.ts` — Accept "upgrade" plan

Change line 42:
```typescript
plan: z.enum(["basic", "pro", "upgrade"]),
```

### Verification checklist
- [ ] `pnpm build` passes with no TypeScript errors
- [ ] `STRIPE_PRICE_UPGRADE_USD` present in `.env.example`
- [ ] `grep -r "upgrade_usd" lib/stripe.ts` returns the new entry
- [ ] `grep report_tier supabase/migrations/20260529000000_report_tier.sql` returns the ADD COLUMN line

---

## Phase 2 — Checkout API: Handle Upgrade Plan

**Goal**: When `plan === "upgrade"`, create a Stripe checkout for $15 that carries the
`contract_session_id` in metadata so the webhook knows which contract to upgrade.

**File**: `app/api/checkout/route.ts`

The current checkout code (`lines 22-55`) already looks up `PLANS[planKey]`. For `upgrade_usd`
this now resolves correctly. The only special handling needed is the success URL:

```typescript
// After line 43 (plan lookup), replace the success_url line:
success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&plan=${
  input.plan === "upgrade" ? "upgrade" : plan.tier
}`,
```

No other changes needed in checkout — metadata already carries `session_id` (the contract
session_id) which is used by the webhook.

### Verification checklist
- [ ] POST `/api/checkout` with `{plan:"upgrade", sessionId:"<contract-session-uuid>"}` returns a Stripe URL
- [ ] That URL redirects to `/success?...&plan=upgrade` after payment

---

## Phase 3 — Webhook: Handle Upgrade + Write `report_tier`

**File**: `app/api/webhook/route.ts`

Two changes:

**3.1 — Write `report_tier` when analysis completes** (inside `triggerRealAnalysis`):

At line 172, change:
```typescript
// OLD
.update({ analysis, status: "done" })
// NEW
.update({ analysis, status: "done", report_tier: tier === "pro" ? "full" : "basic" })
```

This ensures $29 pro buyers get `report_tier = 'full'` from day one.

**3.2 — Handle upgrade payments** (in the `checkout.session.completed` block):

After the existing payment upsert (after line 56), add:

```typescript
// Upgrade flow: no re-analysis, just promote report_tier to full
if (plan.startsWith("upgrade") && contractSessionId) {
  const { error: upgradeError } = await supabase
    .from("contracts")
    .update({ report_tier: "full" })
    .eq("session_id", contractSessionId);
  if (upgradeError) {
    console.error("[webhook] upgrade tier error:", upgradeError.message);
  }
  return NextResponse.json({ received: true });
}
```

Place this block BEFORE the `if (contractSessionId)` block that calls `triggerRealAnalysis`
(current line 87), so upgrade payments skip analysis entirely.

### Verification checklist
- [ ] After a $9 basic payment, `contracts.report_tier = 'basic'` in DB
- [ ] After a $29 pro payment, `contracts.report_tier = 'full'` in DB
- [ ] After a $15 upgrade payment, `contracts.report_tier` changes from `'basic'` → `'full'`
- [ ] TypeScript: `report_tier` update does not cause type errors (column is `text`)

---

## Phase 4 — Status API: Return `report_tier` and `contract_session_id`

**File**: `app/api/contract/status/route.ts`

Change the `contracts` select at line 29:
```typescript
// OLD
.select("status, analysis")
// NEW
.select("status, analysis, report_tier, session_id")
```

Change the return at line 35:
```typescript
return NextResponse.json({
  status:              (contract?.status ?? "pending") as "pending" | "done" | "error",
  analysis:            contract?.status === "done" ? (contract.analysis ?? null) : null,
  report_tier:         contract?.report_tier ?? "basic",
  contract_session_id: contract?.session_id ?? null,
});
```

### Verification checklist
- [ ] `GET /api/contract/status?stripe_session=X` returns `report_tier` and `contract_session_id` fields
- [ ] TypeScript: no `any` introduced; shape matches usage in SuccessContent

---

## Phase 5 — `InlineReport`: Tier-gated Basic vs Full UI

**File**: `app/success/SuccessContent.tsx` — `InlineReport` component (lines 224–397)

Change the prop type:
```typescript
function InlineReport({ analysis, tier }: { analysis: ContrivoxAnalysis; tier: "basic" | "full" }) {
```

Add a helper to sort clauses highest-risk first:
```typescript
const RISK_ORDER = { high: 0, medium: 1, low: 2 };
const sortedClauses = [...(analysis.key_clauses ?? [])].sort(
  (a, b) => (RISK_ORDER[a.risk_level] ?? 2) - (RISK_ORDER[b.risk_level] ?? 2)
);
const firstClause = sortedClauses[0];
const lockedClauses = sortedClauses.slice(1);
```

### For `tier === "basic"` — Key Clauses section

Replace the existing `key_clauses.map(...)` block with:

```tsx
{/* Always show first clause fully */}
<p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: FONT, marginBottom: 12 }}>
  Showing 1 of {sortedClauses.length} clauses — unlock to see all
</p>
{firstClause && <ClauseDetail clause={firstClause} />}

{/* Locked clauses — blur overlay */}
{lockedClauses.length > 0 && (
  <div style={{ position: "relative", marginTop: 10, borderRadius: 12, overflow: "hidden" }}>
    <div style={{ filter: "blur(4px)", userSelect: "none", pointerEvents: "none" }}>
      {lockedClauses.slice(0, 2).map((c, i) => <ClauseDetail key={i} clause={c} />)}
    </div>
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(to bottom, rgba(7,7,15,0.1) 0%, rgba(7,7,15,0.85) 60%)",
      display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 20,
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(167,139,250,0.9)", fontFamily: FONT }}>
        🔒 {lockedClauses.length} more clause{lockedClauses.length !== 1 ? "s" : ""} — unlock to read
      </span>
    </div>
  </div>
)}
```

### For `tier === "basic"` — Red Flags section

Show the flag `issue` headline for all flags, but blur `why_it_matters` and hide negotiation scripts:
```tsx
{analysis.red_flags.map((flag, i) => (
  <div key={i} style={{ /* existing border-left card */ }}>
    <span style={{ fontWeight: 700, fontSize: 14, color: C.heading }}>{flag.issue}</span>
    {tier === "basic" ? (
      <p style={{ filter: "blur(3px)", userSelect: "none", color: C.muted, fontSize: 13.5, lineHeight: 1.7, marginTop: 8 }}>
        {flag.why_it_matters}
      </p>
    ) : (
      <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.7, marginTop: 8 }}>
        {flag.why_it_matters}
      </p>
    )}
    {tier === "full" && flag.challengeable && flag.challenge && (
      /* existing negotiation script block */
    )}
  </div>
))}
```

### For `tier === "basic"` — Missing Protections section

Blur the list:
```tsx
<div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
  <div style={{ filter: tier === "basic" ? "blur(4px)" : "none", userSelect: tier === "basic" ? "none" : "auto", pointerEvents: tier === "basic" ? "none" : "auto" }}>
    {/* existing ul with protections */}
  </div>
  {tier === "basic" && (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(7,7,15,0.6)", borderRadius: 12 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(167,139,250,0.9)" }}>
        🔒 {analysis.missing_protections.length} missing protection{analysis.missing_protections.length !== 1 ? "s" : ""} — unlock to see all
      </span>
    </div>
  )}
</div>
```

### For `tier === "basic"` — Inline upsell card

Add below the Missing Protections section, before Overall Recommendation:
```tsx
{tier === "basic" && onUpgrade && (
  <div style={{
    padding: "22px 20px", borderRadius: 16,
    background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.3)",
    textAlign: "center", marginBottom: 44,
  }}>
    <p style={{ fontFamily: FONT_SERIF, fontSize: 20, color: "white", marginBottom: 8 }}>
      Unlock Your Full Report
    </p>
    <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.65, marginBottom: 6 }}>
      Negotiation scripts · All clauses explained · Missing protections · PDF
    </p>
    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 20, fontStyle: "italic" }}>
      Most users unlock after seeing their risk score.
    </p>
    <button
      onClick={onUpgrade}
      style={{
        padding: "14px 36px", fontSize: 15, fontWeight: 700,
        background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
        color: "white", border: "none", borderRadius: 12,
        cursor: "pointer", fontFamily: FONT,
        boxShadow: "0 4px 24px rgba(99,102,241,0.45)",
      }}
    >
      Unlock Full Report — $15
    </button>
  </div>
)}
```

Update `InlineReport` signature to accept `onUpgrade`:
```typescript
function InlineReport({
  analysis,
  tier,
  onUpgrade,
}: {
  analysis: ContrivoxAnalysis;
  tier: "basic" | "full";
  onUpgrade?: () => void;
})
```

### Verification checklist
- [ ] Basic tier: first clause shown fully, rest blurred with lock badge
- [ ] Basic tier: red flag issues visible, `why_it_matters` blurred
- [ ] Basic tier: missing protections count shown, list blurred
- [ ] Basic tier: inline upsell card renders with `onUpgrade` prop
- [ ] Full tier: all content visible, no blur
- [ ] TypeScript check passes

---

## Phase 6 — `SuccessContent`: Upgrade UX + Tier from API

**File**: `app/success/SuccessContent.tsx` — `SuccessContent` component (lines 400–731)

### 6.1 — Read `report_tier` and `contract_session_id` from status API

Add state variables after line 414:
```typescript
const [reportTier, setReportTier]               = useState<"basic" | "full">("basic");
const [contractSessionId, setContractSessionId] = useState<string | null>(null);
const [upgradeLoading, setUpgradeLoading]       = useState(false);
```

In the poll function, when `data.status === "done"`:
```typescript
if (data.analysis) setAnalysis(data.analysis as ContrivoxAnalysis);
setReportTier((data.report_tier === "full" ? "full" : "basic") as "basic" | "full");
setContractSessionId(data.contract_session_id ?? null);
setDone(true);
```

For the upgrade case (`?plan=upgrade`), the contract is already analysed — so `status` will be
`"done"` immediately on the first poll. The tier will be `"full"` once the webhook fires.
Poll until `report_tier === "full"` to confirm the upgrade is complete:
```typescript
if (data.status === "done") {
  if (urlPlan === "upgrade" && data.report_tier !== "full") {
    // Upgrade webhook hasn't fired yet — keep polling
    return;
  }
  clearInterval(pollRef.current!);
  clearInterval(msgRef.current!);
  // ... set states
}
```

Where `urlPlan` is the `?plan` URL param (kept for loading-state messaging only):
```typescript
const urlPlan = searchParams.get("plan") ?? "basic";
```

### 6.2 — `handleUpgrade` function

Add after `handleRetry` (line 494):
```typescript
const handleUpgrade = useCallback(async () => {
  if (upgradeLoading || !contractSessionId) return;
  setUpgradeLoading(true);
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "upgrade", sessionId: contractSessionId }),
    });
    if (!res.ok) throw new Error("Checkout failed");
    const { url } = await res.json();
    if (url) window.location.href = url;
  } catch {
    setUpgradeLoading(false);
  }
}, [upgradeLoading, contractSessionId]);
```

### 6.3 — Pass `onUpgrade` to `InlineReport`

Change line 692:
```tsx
{hasFullReport && <InlineReport analysis={analysis} tier={reportTier} onUpgrade={reportTier === "basic" ? handleUpgrade : undefined} />}
```

### 6.4 — Sticky bottom bar: upgrade vs analyse-another

Replace the sticky bar (lines 516-537) with conditional logic:
```tsx
{hasFullReport && (
  <div style={{
    position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
    padding: "12px 20px",
    background: "rgba(7,7,15,0.92)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderTop: "1px solid rgba(255,255,255,0.09)",
    display: "flex", justifyContent: "center", gap: 12, alignItems: "center",
  }}>
    {reportTier === "basic" ? (
      <>
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleUpgrade}
            disabled={upgradeLoading || !contractSessionId}
            style={{
              padding: "11px 32px", borderRadius: 10,
              background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
              color: "white", border: "none",
              fontSize: 14, fontWeight: 700,
              cursor: upgradeLoading ? "not-allowed" : "pointer",
              fontFamily: FONT,
              boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
            }}
          >
            {upgradeLoading ? "Redirecting…" : "Unlock Full Report — $15"}
          </button>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 5, fontFamily: FONT }}>
            Most users unlock after seeing their risk score.
          </p>
        </div>
        <a href="/" style={{
          padding: "9px 18px", borderRadius: 10,
          background: "rgba(255,255,255,0.04)",
          border: "0.5px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.45)", fontSize: 12,
          textDecoration: "none", fontFamily: FONT, fontWeight: 600,
          flexShrink: 0,
        }}>
          ← New analysis
        </a>
      </>
    ) : (
      <a href="/" style={{
        padding: "9px 32px", borderRadius: 10,
        background: "rgba(255,255,255,0.06)",
        border: "0.5px solid rgba(255,255,255,0.14)",
        color: "rgba(255,255,255,0.65)",
        fontSize: 13, fontWeight: 600,
        textDecoration: "none", fontFamily: FONT,
      }}>
        ← Analyse Another Contract
      </a>
    )}
  </div>
)}
```

### 6.5 — Remove the inline basic upsell banner from SuccessContent (lines 645-654)

The inline upsell card is now inside `InlineReport`. Remove the duplicate at lines 645-654.

### 6.6 — Loading state copy for upgrade

In the "Analysing state" section, the step icons at line 577 show tier-specific copy.
Add `urlPlan === "upgrade"` handling:
```typescript
const isUpgrade = urlPlan === "upgrade";
// In the steps array:
[isUpgrade ? "⚡" : tier === "pro" ? "✉" : "📊",
 isUpgrade ? "Upgrading your report" : tier === "pro" ? "Report on its way" : "Results loading",
 "rgba(255,255,255,0.2)"]
```
And the heading/subtitle:
```typescript
<h1>
  {isUpgrade ? "Unlocking your full report…" : slow ? "Still working on your report…" : "Analysing your contract"}
</h1>
<p>
  {isUpgrade
    ? "Activating your upgrade — this takes just a moment."
    : slow
      ? "This contract is taking a bit longer than usual..."
      : "This usually takes 60–90 seconds."}
</p>
```

### Verification checklist
- [ ] Basic tier success page: sticky bar shows "Unlock Full Report — $15"
- [ ] Clicking upgrade redirects to Stripe checkout
- [ ] After upgrade payment: `/success?...&plan=upgrade` polls, detects `report_tier:"full"`, shows full report
- [ ] Full/pro tier success page: sticky bar shows "Analyse Another Contract" (unchanged)
- [ ] No duplicate upsell banners on the page
- [ ] Mobile: sticky bar is touch-friendly (min-height 48px per existing CSS)

---

## Phase 7 — Verification Pass

### TypeScript
```
pnpm build
```
Must complete with zero TypeScript errors.

### Anti-pattern grep checks
```bash
# Confirm no hardcoded tier in URL used as sole gate
grep -n "searchParams.get.*plan" app/success/SuccessContent.tsx
# Should only appear in urlPlan variable and loading-state copy

# Confirm no select * 
grep -n "select\(\"\*\"\)" app/api/contract/status/route.ts
# Should return nothing

# Confirm upgrade plan rejected by old checkout if someone sends it without sessionId
# (checkoutInputSchema already validates sessionId as uuid — nullish — which is fine since
#  upgrade without a contract session_id will be a no-op in the webhook)
```

### End-to-end smoke test checklist
- [ ] Upload a contract → get preview → click "Get Basic →" → Stripe test checkout → 
      success page shows partial report with blur
- [ ] On basic success page, click "Unlock Full Report — $15" → Stripe test checkout →
      redirects to `/success?...&plan=upgrade` → polling resolves → full report revealed
- [ ] Upload a contract → click "Get Full Report →" → Stripe test checkout →
      success page shows full report with PDF download (existing pro flow unchanged)
- [ ] `pnpm build` clean
- [ ] `supabase db push` applies the migration on prod (run after testing locally)

---

## Environment Variables Needed (Vercel Dashboard)

| Variable | Value |
|---|---|
| `STRIPE_PRICE_UPGRADE_USD` | Create a new $15 one-time price in Stripe dashboard, copy price ID |

---

## Execution Order

Run these phases sequentially in separate chat sessions if needed — each is self-contained:

1. **Phase 1** — Migration + config (no UI changes, safe to ship first)
2. **Phase 2 + 3** — Checkout + webhook (can deploy together; existing flows unaffected until a real upgrade checkout is triggered)
3. **Phase 4** — Status API (non-breaking addition to response shape)
4. **Phase 5** — InlineReport UI (tier-gated display; basic users see same or better than today until Phase 6 lands)
5. **Phase 6** — SuccessContent upgrade UX (completes the end-to-end flow)
6. **Phase 7** — Verify everything

---

## Files Changed (Summary)

| File | Change |
|---|---|
| `supabase/migrations/20260529000000_report_tier.sql` | **NEW** — adds `report_tier` column |
| `.env.example` | Add `STRIPE_PRICE_UPGRADE_USD=` |
| `lib/stripe.ts` | Add `upgrade_usd` plan + extend `PlanTier` |
| `lib/validation.ts` | Add `"upgrade"` to checkout plan enum |
| `app/api/checkout/route.ts` | Fix success URL for upgrade plan |
| `app/api/webhook/route.ts` | Write `report_tier` on analysis; handle upgrade payments |
| `app/api/contract/status/route.ts` | Return `report_tier` + `contract_session_id` |
| `app/success/SuccessContent.tsx` | Tier-gated `InlineReport` + upgrade banner + `handleUpgrade` |
