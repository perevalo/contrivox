# Contrivox Design System — MASTER

> **Status:** Awaiting approval — do not apply to source files until approved.
> **Last updated:** 2026-06-01
> **Stack:** Next.js 14 App Router · TypeScript · CSS Variables (no Tailwind) · DM Sans + Fraunces
> **Product:** Legal contract analysis SaaS · Dark-first · Conversion-focused

---

## 0. Visual Direction

### Design Language: "Precision Authority"

Contrivox sits at the intersection of **legal credibility** and **modern AI SaaS**. The design language communicates:

- **Trust first** — Users are sharing sensitive documents. Every pixel must reduce anxiety, not introduce it.
- **Clarity over decoration** — Legal content demands unambiguous hierarchy. No visual noise that competes with findings.
- **Premium confidence** — $9–$29 for AI legal analysis is a considered purchase. The UI must feel worth more than it costs.
- **Quiet urgency** — Guide users through the funnel without feeling pushy. CTAs are authoritative, not aggressive.

### Visual Principles

| Principle | Application |
|-----------|-------------|
| **Surface elevation tells the story** | Depth communicates importance — the upload zone and results are raised, not flat |
| **Color means something** | Only use red/amber/green for actual risk signals; never as decoration |
| **Whitespace is trust** | Generous padding signals confidence and readability |
| **The gradient earns its place** | Violet-indigo gradient used exclusively on primary CTAs, the logo, and score highlights — not scattered |
| **Motion serves information** | Animations reveal state changes (fadeUp on load, spin on processing) — never purely decorative loops |

### Mood References
- Anthropic.com (clean authority, dark mode first)
- Linear.app (spatial depth, crisp typography)
- Stripe.com (trust gradients, generous whitespace)
- Notion.so (clean information hierarchy)

---

## 1. Color System

### Brand Gradient (Universal — same in both themes)

```css
--cvx-accent-grad: linear-gradient(135deg, #7c3aed 0%, #6366f1 55%, #4f46e5 100%);
--cvx-accent-grad-hover: linear-gradient(135deg, #6d28d9 0%, #4f46e5 55%, #4338ca 100%);
--cvx-accent-grad-glow: 0 0 24px rgba(124, 58, 237, 0.45), 0 0 48px rgba(99, 102, 241, 0.20);
```

### Dark Theme (`:root` and `[data-theme="dark"]`)

```css
/* ── Backgrounds / Surfaces ─────────────────────────────────── */
--cvx-bg:           #09090f;          /* page canvas */
--cvx-bg-subtle:    #0d0d14;          /* secondary sections, hero overlays */
--cvx-surface:      rgba(255,255,255,0.05);  /* base card */
--cvx-surface-2:    rgba(255,255,255,0.08);  /* raised card, hover state */
--cvx-surface-3:    rgba(255,255,255,0.11);  /* active card, dropdown */
--cvx-surface-4:    rgba(255,255,255,0.16);  /* highest elevation (modals) */
--cvx-nav:          rgba(9,9,15,0.92);       /* navbar with backdrop-filter */
--cvx-modal:        #101018;
--cvx-overlay:      rgba(0,0,0,0.82);        /* modal backdrop */

/* ── Brand ───────────────────────────────────────────────────── */
--cvx-accent:       #8b5cf6;          /* primary violet (purple-500) */
--cvx-accent-light: rgba(139,92,246,0.15);   /* accent tint backgrounds */
--cvx-accent-border:rgba(139,92,246,0.30);   /* accent-tinted borders */

/* ── Text ────────────────────────────────────────────────────── */
--cvx-heading:      #f0eeff;          /* violet-tinted near-white */
--cvx-text:         rgba(240,238,255,0.87);  /* body — WCAG AA 4.8:1 */
--cvx-muted:        rgba(255,255,255,0.55);  /* secondary labels */
--cvx-faint:        rgba(255,255,255,0.30);  /* placeholder, decorative */
--cvx-disabled:     rgba(255,255,255,0.22);  /* disabled elements */

/* ── Semantic (Risk) ─────────────────────────────────────────── */
--cvx-danger:       #f87171;          /* red-400 */
--cvx-danger-bg:    rgba(248,113,113,0.10);
--cvx-danger-border:rgba(248,113,113,0.25);
--cvx-warning:      #fbbf24;          /* amber-400 */
--cvx-warning-bg:   rgba(251,191,36,0.10);
--cvx-warning-border:rgba(251,191,36,0.25);
--cvx-success:      #4ade80;          /* green-400 */
--cvx-success-bg:   rgba(74,222,128,0.10);
--cvx-success-border:rgba(74,222,128,0.25);
--cvx-info:         #60a5fa;          /* blue-400 */
--cvx-info-bg:      rgba(96,165,250,0.10);
--cvx-info-border:  rgba(96,165,250,0.25);

/* ── Borders & Dividers ──────────────────────────────────────── */
--cvx-border:       rgba(255,255,255,0.09);
--cvx-border-strong:rgba(255,255,255,0.16);
--cvx-border-focus: rgba(139,92,246,0.60);  /* focused input ring */

/* ── Form Inputs ─────────────────────────────────────────────── */
--cvx-input-bg:     rgba(255,255,255,0.07);
--cvx-placeholder:  rgba(255,255,255,0.28);
--cvx-select-bg:    #16162a;

/* ── Scrollbar ───────────────────────────────────────────────── */
--cvx-scrollbar:    rgba(255,255,255,0.12);
--cvx-scrollbar-hover: rgba(255,255,255,0.20);

/* ── Special ─────────────────────────────────────────────────── */
--cvx-paywall-grad: linear-gradient(to bottom,
    rgba(9,9,15,0.00)  0%,
    rgba(9,9,15,0.85) 20%,
    rgba(9,9,15,1.00) 40%);
```

### Light Theme (`[data-theme="light"]`)

```css
/* ── Backgrounds / Surfaces ─────────────────────────────────── */
--cvx-bg:           #f7f6ff;          /* violet-tinted off-white */
--cvx-bg-subtle:    #eeecff;          /* secondary sections */
--cvx-surface:      #ffffff;
--cvx-surface-2:    rgba(99,102,241,0.05);
--cvx-surface-3:    rgba(99,102,241,0.09);
--cvx-surface-4:    rgba(99,102,241,0.13);
--cvx-nav:          rgba(247,246,255,0.94);
--cvx-modal:        #ffffff;
--cvx-overlay:      rgba(13,11,30,0.55);

/* ── Brand ───────────────────────────────────────────────────── */
--cvx-accent:       #7c3aed;          /* slightly deeper for contrast */
--cvx-accent-light: rgba(124,58,237,0.10);
--cvx-accent-border:rgba(124,58,237,0.25);

/* ── Text ────────────────────────────────────────────────────── */
--cvx-heading:      #0d0b1e;          /* deep indigo-black */
--cvx-text:         rgba(13,11,30,0.86);     /* WCAG AA 5.8:1 on bg */
--cvx-muted:        rgba(13,11,30,0.56);
--cvx-faint:        rgba(13,11,30,0.32);
--cvx-disabled:     rgba(13,11,30,0.24);

/* ── Semantic (Risk) ─────────────────────────────────────────── */
--cvx-danger:       #dc2626;          /* red-600 */
--cvx-danger-bg:    rgba(220,38,38,0.08);
--cvx-danger-border:rgba(220,38,38,0.22);
--cvx-warning:      #d97706;          /* amber-600 */
--cvx-warning-bg:   rgba(217,119,6,0.08);
--cvx-warning-border:rgba(217,119,6,0.22);
--cvx-success:      #16a34a;          /* green-600 */
--cvx-success-bg:   rgba(22,163,74,0.08);
--cvx-success-border:rgba(22,163,74,0.22);
--cvx-info:         #2563eb;          /* blue-600 */
--cvx-info-bg:      rgba(37,99,235,0.08);
--cvx-info-border:  rgba(37,99,235,0.20);

/* ── Borders & Dividers ──────────────────────────────────────── */
--cvx-border:       rgba(99,102,241,0.13);
--cvx-border-strong:rgba(99,102,241,0.25);
--cvx-border-focus: rgba(124,58,237,0.55);

/* ── Form Inputs ─────────────────────────────────────────────── */
--cvx-input-bg:     #ffffff;
--cvx-placeholder:  rgba(13,11,30,0.34);
--cvx-select-bg:    #eee9ff;

/* ── Scrollbar ───────────────────────────────────────────────── */
--cvx-scrollbar:    rgba(99,102,241,0.22);
--cvx-scrollbar-hover: rgba(99,102,241,0.35);

/* ── Special ─────────────────────────────────────────────────── */
--cvx-paywall-grad: linear-gradient(to bottom,
    rgba(247,246,255,0.00)  0%,
    rgba(247,246,255,0.85) 20%,
    rgba(247,246,255,1.00) 40%);
```

### Score Ring Color Map (Universal)

```css
--cvx-score-fair:        #22c55e;   /* green-500  — 85–100 */
--cvx-score-acceptable:  #84cc16;   /* lime-500   — 70–84 */
--cvx-score-concerning:  #f59e0b;   /* amber-500  — 50–69 */
--cvx-score-unfair:      #f97316;   /* orange-500 — 30–49 */
--cvx-score-dangerous:   #ef4444;   /* red-500    — 0–29  */
```

### Risk Badge Map (Universal)

```css
--cvx-risk-high:   #ef4444;
--cvx-risk-medium: #f59e0b;
--cvx-risk-low:    #22c55e;
```

---

## 2. Typography Scale

### Font Stack

```css
--cvx-font-display: 'Fraunces', Georgia, 'Times New Roman', serif;
--cvx-font-body:    'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--cvx-font-mono:    'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

**Usage rule:**
- `--cvx-font-display` → Logo, hero headlines, marketing H1s, score display number
- `--cvx-font-body` → All UI text: labels, buttons, body copy, cards, inputs
- `--cvx-font-mono` → Clause excerpts, extracted contract text, code

### Named Type Scale

| Token | Font | Size | Weight | Line-height | Letter-spacing | Use |
|-------|------|------|--------|-------------|----------------|-----|
| `--cvx-type-display` | Fraunces | `clamp(48px,6vw,72px)` | 700 | 1.05 | -0.03em | Hero headline |
| `--cvx-type-h1` | Fraunces | `clamp(36px,4.5vw,52px)` | 700 | 1.1 | -0.025em | Page title |
| `--cvx-type-h2` | Fraunces | `clamp(26px,3.5vw,38px)` | 600 | 1.15 | -0.02em | Section title |
| `--cvx-type-h3` | DM Sans | `clamp(20px,2.5vw,26px)` | 600 | 1.25 | -0.01em | Card title, subsection |
| `--cvx-type-h4` | DM Sans | `clamp(17px,2vw,20px)` | 600 | 1.3 | 0 | Label heading |
| `--cvx-type-body-lg` | DM Sans | 18px | 400 | 1.7 | 0 | Lead paragraph |
| `--cvx-type-body` | DM Sans | 16px | 400 | 1.65 | 0 | Body copy (default) |
| `--cvx-type-body-sm` | DM Sans | 14px | 400 | 1.6 | 0 | Secondary body text |
| `--cvx-type-caption` | DM Sans | 13px | 500 | 1.45 | 0 | Metadata, timestamps |
| `--cvx-type-label` | DM Sans | 11px | 700 | 1.0 | 0.07em | Overline labels (UPPERCASE) |
| `--cvx-type-code` | Mono | 13px | 400 | 1.6 | 0 | Contract excerpts |
| `--cvx-type-btn` | DM Sans | 14.5px | 700 | 1.0 | 0.01em | Button text |
| `--cvx-type-score` | Fraunces | `clamp(56px,7vw,80px)` | 700 | 1.0 | -0.04em | Score ring number |

### CSS Variable Declarations

```css
/* Add to :root in globals.css */
--cvx-font-display: 'Fraunces', Georgia, serif;
--cvx-font-body:    'DM Sans', -apple-system, sans-serif;
--cvx-font-mono:    'JetBrains Mono', 'Consolas', monospace;

--cvx-ts-display:   clamp(48px, 6vw, 72px);
--cvx-ts-h1:        clamp(36px, 4.5vw, 52px);
--cvx-ts-h2:        clamp(26px, 3.5vw, 38px);
--cvx-ts-h3:        clamp(20px, 2.5vw, 26px);
--cvx-ts-h4:        clamp(17px, 2vw, 20px);
--cvx-ts-body-lg:   18px;
--cvx-ts-body:      16px;
--cvx-ts-body-sm:   14px;
--cvx-ts-caption:   13px;
--cvx-ts-label:     11px;
--cvx-ts-code:      13px;
--cvx-ts-btn:       14.5px;
--cvx-ts-score:     clamp(56px, 7vw, 80px);
```

---

## 3. Spacing Scale

**Base unit: 4px**

| Token | px | rem | Use |
|-------|----|-----|-----|
| `--sp-1` | 4px | 0.25rem | Icon gap, tight padding |
| `--sp-2` | 8px | 0.5rem | Inner badge padding, icon+label gap |
| `--sp-3` | 12px | 0.75rem | Input padding vertical |
| `--sp-4` | 16px | 1rem | Standard element padding |
| `--sp-5` | 20px | 1.25rem | Card inner padding (compact) |
| `--sp-6` | 24px | 1.5rem | Card inner padding (default) |
| `--sp-8` | 32px | 2rem | Section gap, card gap |
| `--sp-10` | 40px | 2.5rem | Large card padding |
| `--sp-12` | 48px | 3rem | Section vertical padding |
| `--sp-16` | 64px | 4rem | Section separator |
| `--sp-20` | 80px | 5rem | Hero vertical padding |
| `--sp-24` | 96px | 6rem | Page top padding |

```css
/* Add to :root */
--sp-1: 4px;   --sp-2: 8px;   --sp-3: 12px;  --sp-4: 16px;
--sp-5: 20px;  --sp-6: 24px;  --sp-8: 32px;  --sp-10: 40px;
--sp-12: 48px; --sp-16: 64px; --sp-20: 80px; --sp-24: 96px;
```

---

## 4. Border Radius Scale

| Token | px | Use |
|-------|----|-----|
| `--r-none` | 0 | Dividers |
| `--r-xs` | 3px | Inline badges, pills inside text |
| `--r-sm` | 6px | Buttons (secondary, ghost), small inputs |
| `--r-md` | 10px | Standard buttons, inputs, tags |
| `--r-lg` | 14px | Cards (compact) |
| `--r-xl` | 20px | Cards (featured), upload zone |
| `--r-2xl` | 28px | Modal container |
| `--r-full` | 9999px | Pills, avatar rings, toggle |

```css
--r-none: 0;    --r-xs: 3px;   --r-sm: 6px;   --r-md: 10px;
--r-lg: 14px;   --r-xl: 20px;  --r-2xl: 28px; --r-full: 9999px;
```

---

## 5. Shadow & Elevation Scale

### Dark Theme

```css
--shadow-sm:  0 1px 3px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.20);
--shadow-md:  0 4px 12px rgba(0,0,0,0.40), 0 2px 4px rgba(0,0,0,0.25);
--shadow-lg:  0 8px 28px rgba(0,0,0,0.55), 0 4px 8px rgba(0,0,0,0.30);
--shadow-xl:  0 20px 56px rgba(0,0,0,0.65), 0 8px 16px rgba(0,0,0,0.35);

/* Brand glow variants */
--shadow-accent:    0 4px 20px rgba(124,58,237,0.30), 0 0 48px rgba(99,102,241,0.12);
--shadow-accent-lg: 0 8px 32px rgba(124,58,237,0.45), 0 0 64px rgba(99,102,241,0.20);
--shadow-danger:    0 4px 16px rgba(248,113,113,0.25);
--shadow-success:   0 4px 16px rgba(74,222,128,0.20);
```

### Light Theme Override

```css
[data-theme="light"] {
  --shadow-sm:  0 1px 3px rgba(99,102,241,0.08), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md:  0 4px 12px rgba(99,102,241,0.12), 0 2px 4px rgba(0,0,0,0.07);
  --shadow-lg:  0 8px 28px rgba(99,102,241,0.16), 0 4px 8px rgba(0,0,0,0.09);
  --shadow-xl:  0 20px 56px rgba(99,102,241,0.20), 0 8px 16px rgba(0,0,0,0.10);
  --shadow-accent:    0 4px 20px rgba(124,58,237,0.20), 0 0 32px rgba(99,102,241,0.10);
  --shadow-accent-lg: 0 8px 32px rgba(124,58,237,0.30), 0 0 48px rgba(99,102,241,0.15);
}
```

### Elevation Usage Map

| Level | Token | Applied To |
|-------|-------|------------|
| 0 | none | Page background, dividers |
| 1 | `--shadow-sm` | Tags, pills, inline elements |
| 2 | `--shadow-md` | Cards, inputs on focus |
| 3 | `--shadow-lg` | Paywall panel, expanded cards |
| 4 | `--shadow-xl` | Modals, auth overlays |
| Brand | `--shadow-accent` | Primary CTA buttons (hover) |
| Brand-strong | `--shadow-accent-lg` | Hero CTA, download button |

---

## 6. Animation Tokens

### Duration

```css
--dur-instant:   80ms;    /* state switches (toggle, badge) */
--dur-fast:      150ms;   /* hover color transitions */
--dur-base:      200ms;   /* standard micro-interactions */
--dur-slow:      300ms;   /* reveals, expand/collapse */
--dur-enter:     450ms;   /* page entry animations */
--dur-loading:   1200ms;  /* pulse/spin loop cycle */
```

### Easing

```css
--ease-standard:  cubic-bezier(0.4, 0.0, 0.2, 1);   /* most transitions */
--ease-decel:     cubic-bezier(0.0, 0.0, 0.2, 1);   /* elements entering screen */
--ease-accel:     cubic-bezier(0.4, 0.0, 1.0, 1);   /* elements leaving screen */
--ease-bounce:    cubic-bezier(0.34, 1.56, 0.64, 1); /* success micro-bounce */
--ease-spring:    cubic-bezier(0.68, -0.55, 0.265, 1.55); /* score reveal */
```

### Named Keyframes

```css
/* Keep all existing animations unchanged, add: */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 1; }
}
@keyframes glow {
  0%, 100% { box-shadow: var(--shadow-accent); }
  50%      { box-shadow: var(--shadow-accent-lg); }
}
@keyframes checkPop {
  0%   { transform: scale(0); opacity: 0; }
  60%  { transform: scale(1.25); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes progressFill {
  from { width: 0%; }
  to   { width: var(--progress-value, 100%); }
}
```

### Reduced-Motion Override

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Component Specifications

### 7.1 Button

Five variants. All share base structure:
- Font: `var(--cvx-font-body)`, `var(--cvx-ts-btn)`, weight 700
- Min touch target: 44px height
- Cursor: pointer
- Transition: `all var(--dur-fast) var(--ease-standard)`
- Disabled: `opacity: 0.42; cursor: not-allowed; pointer-events: none;`
- Border-radius: `var(--r-md)` (default), `var(--r-sm)` (compact)

#### Primary (Gradient CTA)
```css
/* Default */
background:    var(--cvx-accent-grad);
color:         #ffffff;
border:        none;
padding:       13px 24px;
border-radius: var(--r-md);
box-shadow:    none;

/* Hover */
background:    var(--cvx-accent-grad-hover);
box-shadow:    var(--shadow-accent);
transform:     translateY(-1px);

/* Active / Press */
transform:     translateY(0);
box-shadow:    none;

/* Loading */
opacity: 0.75;
pointer-events: none;
/* Show spinner icon inside */
```

#### Hero CTA (Conversion — largest, full-width option)
```css
/* Default */
background:    var(--cvx-accent-grad);
color:         #ffffff;
padding:       16px 32px;
font-size:     16px;
border-radius: var(--r-md);
box-shadow:    var(--shadow-accent);
letter-spacing: 0.01em;

/* Hover */
background:    var(--cvx-accent-grad-hover);
box-shadow:    var(--shadow-accent-lg);
transform:     translateY(-2px);

/* Pulse animation on idle (draw attention) */
animation:     glow 3s ease-in-out infinite;
/* Stop on hover: animation: none */
```

#### Secondary
```css
/* Default */
background:    var(--cvx-surface-2);
color:         var(--cvx-text);
border:        1px solid var(--cvx-border);
padding:       11px 20px;
border-radius: var(--r-md);

/* Hover */
background:    var(--cvx-surface-3);
border-color:  var(--cvx-border-strong);
```

#### Ghost
```css
/* Default */
background:    transparent;
color:         var(--cvx-muted);
border:        1px solid var(--cvx-border);
padding:       9px 16px;
border-radius: var(--r-sm);

/* Hover */
background:    var(--cvx-surface);
color:         var(--cvx-text);
border-color:  var(--cvx-border-strong);
```

#### Danger
```css
/* Default */
background:    var(--cvx-danger-bg);
color:         var(--cvx-danger);
border:        1px solid var(--cvx-danger-border);
padding:       11px 20px;
border-radius: var(--r-md);

/* Hover */
background:    rgba(248,113,113,0.18);
box-shadow:    var(--shadow-danger);
```

---

### 7.2 Input

```css
/* Base */
background:    var(--cvx-input-bg);
color:         var(--cvx-text);
border:        1px solid var(--cvx-border);
border-radius: var(--r-md);
padding:       12px 16px;
font-family:   var(--cvx-font-body);
font-size:     var(--cvx-ts-body);
line-height:   1.5;
outline:       none;
transition:    border-color var(--dur-fast) var(--ease-standard),
               box-shadow  var(--dur-fast) var(--ease-standard);
width:         100%;

/* Placeholder */
color: var(--cvx-placeholder);

/* Hover */
border-color: var(--cvx-border-strong);

/* Focus */
border-color: var(--cvx-border-focus);
box-shadow:   0 0 0 3px rgba(139,92,246,0.18);

/* Error */
border-color: var(--cvx-danger);
box-shadow:   0 0 0 3px var(--cvx-danger-bg);

/* Success */
border-color: var(--cvx-success);
```

---

### 7.3 Card

Three elevation levels used in the app:

#### Base Card (clause items, FAQ)
```css
background:    var(--cvx-surface);
border:        0.5px solid var(--cvx-border);
border-radius: var(--r-lg);
padding:       var(--sp-5) var(--sp-6);
transition:    background var(--dur-fast) var(--ease-standard),
               border-color var(--dur-fast) var(--ease-standard);

/* Hover (if interactive) */
background:    var(--cvx-surface-2);
border-color:  var(--cvx-border-strong);
```

#### Featured Card (results panel, plan cards)
```css
background:    var(--cvx-surface);
border:        1px solid var(--cvx-border);
border-radius: var(--r-xl);
padding:       var(--sp-8);
box-shadow:    var(--shadow-md);

/* Entry animation */
animation: fadeUp var(--dur-enter) var(--ease-decel) both;
```

#### Accent Card (highlighted recommendation, "Pro" plan)
```css
background:    var(--cvx-surface);
border:        1px solid var(--cvx-accent-border);
border-radius: var(--r-xl);
padding:       var(--sp-8);
box-shadow:    var(--shadow-accent);
position:      relative;
/* Optional: subtle top-bar gradient line */
```

---

### 7.4 Badge / Pill

```css
/* Base (all badges) */
display:        inline-flex;
align-items:    center;
gap:            var(--sp-1);
font-family:    var(--cvx-font-body);
font-size:      var(--cvx-ts-caption);
font-weight:    600;
padding:        4px 10px;
border-radius:  var(--r-full);
white-space:    nowrap;

/* Neutral */
background: var(--cvx-surface-2);
color:      var(--cvx-muted);
border:     1px solid var(--cvx-border);

/* Success */
background: var(--cvx-success-bg);
color:      var(--cvx-success);
border:     1px solid var(--cvx-success-border);

/* Warning */
background: var(--cvx-warning-bg);
color:      var(--cvx-warning);
border:     1px solid var(--cvx-warning-border);

/* Danger */
background: var(--cvx-danger-bg);
color:      var(--cvx-danger);
border:     1px solid var(--cvx-danger-border);

/* Info */
background: var(--cvx-info-bg);
color:      var(--cvx-info);
border:     1px solid var(--cvx-info-border);

/* Accent (feature labels, "AI" tags) */
background: var(--cvx-accent-light);
color:      var(--cvx-accent);
border:     1px solid var(--cvx-accent-border);
```

---

### 7.5 Modal

```css
/* Overlay */
position: fixed; inset: 0;
background: var(--cvx-overlay);
backdrop-filter: blur(6px);
z-index: 50;
animation: fadeIn var(--dur-slow) var(--ease-decel);

/* Container */
background:    var(--cvx-modal);
border:        1px solid var(--cvx-border);
border-radius: var(--r-2xl);
box-shadow:    var(--shadow-xl);
padding:       var(--sp-8);
max-width:     480px;
width:         calc(100% - var(--sp-8));
animation:     scaleIn var(--dur-slow) var(--ease-decel);

/* Header */
font-family:   var(--cvx-font-display);
font-size:     var(--cvx-ts-h3);
color:         var(--cvx-heading);
margin-bottom: var(--sp-6);

/* Close button */
/* Ghost button, 32×32px, top-right corner */
```

---

### 7.6 ScoreRing

The central trust signal. Spec for the SVG ring + number display:

```css
/* Outer container */
display:        flex;
flex-direction: column;
align-items:    center;
gap:            var(--sp-3);

/* SVG ring */
/* Width/height: 140–180px (responsive) */
/* stroke-width: 10px */
/* Track (background): rgba(255,255,255,0.08) */
/* Progress: currentColor mapped to score tier */
/* Transition: stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) */

/* Score number */
font-family:    var(--cvx-font-display);
font-size:      var(--cvx-ts-score);
font-weight:    700;
color:          var(--cvx-heading);
line-height:    1;

/* Score label (e.g., "CONCERNING") */
font-family:    var(--cvx-font-body);
font-size:      var(--cvx-ts-label);
font-weight:    700;
letter-spacing: 0.08em;
text-transform: uppercase;
color:          var(--score-color);  /* from score tier map */
```

**Score tier → CSS color map:**
```javascript
const SCORE_COLOR = {
  'Fair':        'var(--cvx-score-fair)',
  'Acceptable':  'var(--cvx-score-acceptable)',
  'Concerning':  'var(--cvx-score-concerning)',
  'Unfair':      'var(--cvx-score-unfair)',
  'Dangerous':   'var(--cvx-score-dangerous)',
};
```

---

### 7.7 RiskBadge (High / Medium / Low indicator dot)

```css
/* Dot indicator */
display:        inline-flex;
align-items:    center;
gap:            6px;
font-size:      var(--cvx-ts-caption);
font-weight:    600;
color:          var(--badge-color);

/* Dot */
width: 7px; height: 7px;
border-radius: var(--r-full);
background: var(--badge-color);
box-shadow: 0 0 6px var(--badge-color);  /* glow only for HIGH */
```

**Risk level → variable:**
```javascript
const RISK_COLOR = {
  high:   'var(--cvx-risk-high)',
  medium: 'var(--cvx-risk-medium)',
  low:    'var(--cvx-risk-low)',
};
```

---

### 7.8 Paywall Panel

The conversion moment — must feel premium, not punitive:

```css
/* Blur overlay mask — sits over the teaser */
background: var(--cvx-paywall-grad);
position:   absolute; inset: 0;
pointer-events: none;

/* CTA card that sits above the mask */
background:    var(--cvx-surface);
border:        1px solid var(--cvx-accent-border);
border-radius: var(--r-xl);
padding:       var(--sp-8) var(--sp-8) var(--sp-10);
box-shadow:    var(--shadow-accent);
text-align:    center;
animation:     fadeUp var(--dur-enter) var(--ease-decel) 0.1s both;

/* Price display */
font-family:   var(--cvx-font-display);
font-size:     clamp(32px, 5vw, 48px);
font-weight:   700;
color:         var(--cvx-heading);

/* Unlock CTA */
/* → Use "Hero CTA" button spec */
/* → Full width inside paywall card */
/* → Pulse animation enabled */
```

---

### 7.9 Upload Zone

The first interaction — must feel inviting, not bureaucratic:

```css
/* Default */
background:    var(--cvx-surface);
border:        2px dashed var(--cvx-border-strong);
border-radius: var(--r-xl);
padding:       var(--sp-16) var(--sp-12);
text-align:    center;
cursor:        pointer;
transition:    all var(--dur-base) var(--ease-standard);

/* Hover / dragover */
background:    var(--cvx-accent-light);
border-color:  var(--cvx-accent-border);
border-style:  solid;
box-shadow:    var(--shadow-accent);
/* Scale icon slightly: transform: scale(1.05) on inner icon */

/* Active / file selected */
background:    var(--cvx-success-bg);
border-color:  var(--cvx-success-border);
border-style:  solid;

/* Icon inside (cloud-upload SVG) */
color:         var(--cvx-muted);
width:         40px; height: 40px;
margin-bottom: var(--sp-4);

/* Label */
font-size:     var(--cvx-ts-body);
color:         var(--cvx-text);
font-weight:   600;

/* Sub-label (accepted formats) */
font-size:     var(--cvx-ts-body-sm);
color:         var(--cvx-muted);
margin-top:    var(--sp-2);
```

---

## 8. Micro-Interactions Summary

| Element | Hover | Focus | Active/Press | Loading |
|---------|-------|-------|--------------|---------|
| Primary Button | `translateY(-1px)` + accent shadow | — | `translateY(0)` | 0.75 opacity + spinner |
| Hero CTA | `translateY(-2px)` + strong glow | — | `translateY(0)` + reduced shadow | Same |
| Secondary Button | surface-3 bg + strong border | — | surface bg | Same |
| Input | strong border | accent ring (3px) | — | — |
| Card (interactive) | surface-2 bg + strong border | ring-2 accent | surface-3 bg | — |
| Upload Zone | accent-light bg + solid border + icon scale | ring-2 accent | success-bg | spin animation |
| Score Ring | — | — | — | Animated progress draw (1.2s spring) |
| Risk Badge | — | — | — | pulse animation while loading |
| Paywall CTA | `translateY(-2px)` + strong glow | — | back to default | — |
| Nav links | text → heading color | ring-1 | — | — |
| Theme Toggle | surface-3 bg | ring-1 | scale(0.95) | — |

---

## 9. Layout System

### Container Widths

```css
--container-xs:   480px;   /* modals, auth panels */
--container-sm:   640px;   /* narrow content (contact, legal) */
--container-md:   760px;   /* main app (Contrivox.jsx) */
--container-lg:   960px;   /* success/report page */
--container-xl:  1120px;   /* full-width sections */
--container-max: 1280px;   /* page max-width */
```

### Responsive Breakpoints

```css
/* Mobile first */
--bp-sm:  480px;    /* large phone */
--bp-md:  768px;    /* tablet */
--bp-lg:  1024px;   /* small desktop */
--bp-xl:  1280px;   /* standard desktop */
--bp-2xl: 1536px;   /* large desktop */
```

Usage:
```css
@media (min-width: 768px) { /* tablet+ */ }
@media (min-width: 1024px) { /* desktop+ */ }
```

### Z-Index Scale

```css
--z-base:    1;
--z-raised:  10;     /* cards, dropdowns */
--z-sticky:  20;     /* sticky elements */
--z-nav:     30;     /* navigation */
--z-modal:   50;     /* modals */
--z-toast:   60;     /* toasts, notifications */
--z-top:     99;     /* absolute top (overlays during loading) */
```

### Page Layout Patterns

**Main App (Contrivox.jsx) — max-width: `var(--container-md)` centered:**
```
┌─────────────────────────────────┐
│  NAV (full-width, z-nav)        │
├─────────────────────────────────┤
│  [centered, --container-md]     │
│  ┌───────────────────────────┐  │
│  │  Hero Headline            │  │
│  │  Upload Zone              │  │
│  │  ─────────────────────    │  │
│  │  Analysis Results Card    │  │
│  │  Score Ring + Findings    │  │
│  │  ─────────────────────    │  │
│  │  Paywall CTA              │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Report Page (SuccessContent.tsx) — max-width: `var(--container-lg)`:**
```
┌─────────────────────────────────┐
│  Progress/Status bar            │
│  [centered, --container-lg]     │
│  ┌────────────┐ ┌─────────────┐ │
│  │ Score Ring │ │ Summary     │ │
│  └────────────┘ └─────────────┘ │
│  Red Flags (full width cards)   │
│  Key Clauses (full width cards) │
│  Delivery Panel                 │
└─────────────────────────────────┘
```

---

## 10. Dark/Light Theme Mapping

### Tokens that flip (defined per-theme in CSS)

| Category | Dark value type | Light value type |
|----------|----------------|------------------|
| `--cvx-bg*` | Near-black (#09090f) | Off-white (#f7f6ff) |
| `--cvx-surface*` | White at low opacity | Indigo at low opacity |
| `--cvx-heading` | Near-white (#f0eeff) | Near-black (#0d0b1e) |
| `--cvx-text` | White at 87% | Black at 86% |
| `--cvx-muted` | White at 55% | Black at 56% |
| `--cvx-border` | White at 9% | Indigo at 13% |
| `--cvx-input-bg` | White at 7% | Pure white |
| `--cvx-semantic-*` | 400-level (softer) | 600-level (richer) |
| `--shadow-*` | Black-based | Indigo-tinted |
| `--cvx-scrollbar` | White opacity | Indigo opacity |

### Tokens that are universal (same in both themes)

| Token | Value | Reason |
|-------|-------|--------|
| `--cvx-accent-grad` | violet-indigo | Brand identity, always vivid |
| `--cvx-accent-grad-hover` | darker variant | Hover always darkens |
| `--cvx-score-*` | green/lime/amber/orange/red | Semantic — color carries meaning |
| `--cvx-risk-*` | red/amber/green | Semantic — cannot be ambiguous |
| `--r-*` | radius values | Structural |
| `--sp-*` | spacing values | Structural |
| `--dur-*` | durations | Motion |
| `--ease-*` | easing functions | Motion |
| `--cvx-font-*` | font stacks | Typography |
| `--cvx-ts-*` | type sizes | Typography |
| `--container-*` | widths | Layout |
| `--z-*` | z-index values | Layout |

---

## 11. Implementation Notes

### Migration Strategy (no Tailwind, keep CSS vars)

The goal is **zero behavior change** — only visual improvements. Do not refactor logic.

#### Step 1: Update `app/globals.css`
Replace existing `:root` / `[data-theme]` blocks with the full token set from sections 1–6 above. All new tokens are additive — existing references still work.

#### Step 2: Update inline `COLORS` constant in `Contrivox.jsx`
Extend the existing COLORS object with new tokens:
```javascript
const COLORS = {
  // existing
  bg:         "var(--cvx-bg)",
  surface:    "var(--cvx-surface)",
  border:     "var(--cvx-border)",
  accent:     "var(--cvx-accent)",
  accentGrad: "var(--cvx-accent-grad)",
  danger:     "var(--cvx-danger)",
  text:       "var(--cvx-text)",
  muted:      "var(--cvx-muted)",
  faint:      "var(--cvx-faint)",
  heading:    "var(--cvx-heading)",
  nav:        "var(--cvx-nav)",
  modal:      "var(--cvx-modal)",
  overlay:    "var(--cvx-overlay)",
  inputBg:    "var(--cvx-input-bg)",
  // new additions
  surface2:      "var(--cvx-surface-2)",
  surface3:      "var(--cvx-surface-3)",
  accentLight:   "var(--cvx-accent-light)",
  accentBorder:  "var(--cvx-accent-border)",
  dangerBg:      "var(--cvx-danger-bg)",
  dangerBorder:  "var(--cvx-danger-border)",
  warningBg:     "var(--cvx-warning-bg)",
  successBg:     "var(--cvx-success-bg)",
  borderFocus:   "var(--cvx-border-focus)",
  borderStrong:  "var(--cvx-border-strong)",
};
```

#### Step 3: Apply component specs
For each component spec in section 7, locate the relevant JSX in the monolith and update the inline `style={{}}` object to match. Apply one component type at a time and verify visually.

#### Step 4: Update keyframes in `globals.css`
Add the new keyframes (`fadeIn`, `scaleIn`, `slideDown`, `progressFill`) alongside existing ones.

#### Step 5: Add `prefers-reduced-motion` block
Add the accessibility override at the end of `globals.css`.

### Priority Order for Visual Impact

1. **globals.css token expansion** — all styling cascades from here; highest ROI
2. **Upload Zone** — first user interaction; must feel premium
3. **Primary / Hero CTA buttons** — conversion critical
4. **Score Ring** — the "wow moment" users share
5. **Paywall panel** — direct revenue impact
6. **Cards and badges** — polish that signals quality
7. **Inputs and form elements** — trust during auth/email entry
8. **Nav + theme toggle** — brand consistency on every page

### Inline Style Pattern Reference

Current pattern to update `→` target pattern:

```javascript
// Before: arbitrary hardcoded values
{ padding: "11px 8px", fontSize: 12.5, fontWeight: 700,
  background: "linear-gradient(135deg,#7c3aed,#6366f1 55%,#4f46e5)",
  borderRadius: 9 }

// After: CSS variable tokens
{ padding: "13px 24px", fontSize: "var(--cvx-ts-btn)", fontWeight: 700,
  background: "var(--cvx-accent-grad)",
  borderRadius: "var(--r-md)" }
```

### What NOT to Touch

- Any `onClick`, `onChange`, `onSubmit` handlers
- API call logic (`fetch`, `createAnalysis`, `handleUpload`)
- Stripe `checkout` / `webhook` logic
- `mammoth`, `jspdf`, `marked` integration code
- `localStorage` read/write logic
- Auth state / session handling
- Analytics event calls (PostHog, GA4, Pixel)
- `next.config.js` headers and CSP
- Any routing (`useRouter`, `Link`, `redirect`)

---

## 12. Pre-Delivery Checklist

Before any file is touched, confirm approval of this MASTER.md.

Before considering implementation complete:

- [ ] All new CSS variables added to both `:root`/dark and `[data-theme="light"]`
- [ ] Score ring and risk badge colors unchanged (semantic)
- [ ] All CTAs use Hero CTA spec (gradient + glow)
- [ ] Upload zone has hover, dragover, and file-selected states
- [ ] `prefers-reduced-motion` override added to globals.css
- [ ] Focus rings visible on all interactive elements (keyboard nav)
- [ ] Touch targets ≥ 44px height on all buttons
- [ ] Light mode tested: all text ≥ 4.5:1 contrast, cards visible, borders legible
- [ ] Dark mode tested: no pure-white surfaces, no invisible borders
- [ ] No backend logic, API calls, or handler functions modified
- [ ] `pnpm build` passes with zero TypeScript errors after changes

---

*End of MASTER.md — v1.0 · Awaiting approval*
