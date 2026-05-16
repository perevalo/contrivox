# SKILL: Email Delivery
# Trigger: any task involving sending the Contrivox report by email —
#          Resend API, HTML template, PDF attachment, WhatsApp link.

## What this skill covers
- Resend API integration for transactional email
- Branded HTML email template
- PDF attachment from base64
- WhatsApp deep-link generation
- Email logging to Supabase (hashed — no PII stored)

---

## API ROUTE PATTERN

```typescript
// app/api/send-report/route.ts
import { Resend } from "resend";
import { createServerClient } from "@supabase/ssr";
import { withRateLimit } from "@/lib/rate-limit";
import { sendReportSchema } from "@/lib/validation";
import { buildEmailHTML } from "@/lib/email-template";
import { createHash } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST = withRateLimit(async (req: Request) => {
  const body = sendReportSchema.parse(await req.json());
  const { email, analysis, pdfBase64, language } = body;

  // Hash email for logging — never store plaintext email in logs
  const emailHash = createHash("sha256").update(email.toLowerCase()).digest("hex");

  const { data, error } = await resend.emails.send({
    from: "Contrivox <reports@contrivox.com>",
    to: email,
    subject: buildSubject(analysis, language),
    html: buildEmailHTML(analysis, language),
    attachments: pdfBase64
      ? [{
          filename: "Contrivox-Report.pdf",
          content: Buffer.from(pdfBase64, "base64"),
          contentType: "application/pdf",
        }]
      : [],
  });

  if (error) {
    console.error("[send-report] Resend error:", error.message);
    return Response.json({ error: "delivery_failed" }, { status: 502 });
  }

  // Log delivery (hashed email only — no PII)
  const supabase = createServerClient(/* cookies */);
  await supabase.from("email_log").insert({
    email_hash: emailHash,
    resend_id: data?.id,
    status: "sent",
    language,
  });

  return Response.json({ ok: true });
}, { limit: 20, window: "1h" });
```

---

## VALIDATION SCHEMA

```typescript
// In lib/validation.ts
export const sendReportSchema = z.object({
  email: z.string().email().max(320),
  analysis: ContrivoxAnalysisSchema,
  pdfBase64: z.string().max(10_000_000).optional(), // max ~7.5MB decoded
  language: z.string().length(2),
});
```

---

## SUBJECT LINE BUILDER

```typescript
const SUBJECTS: Record<string, string> = {
  en: "Your Contrivox Report",
  pt: "Seu Relatório Contrivox",
  es: "Tu Informe Contrivox",
  fr: "Votre Rapport Contrivox",
  de: "Ihr Contrivox-Bericht",
};

export function buildSubject(
  analysis: ContrivoxAnalysis,
  lang: string
): string {
  const base = SUBJECTS[lang] ?? SUBJECTS.en;
  return `${base} — ${analysis.contract_type}`;
}
```

---

## HTML EMAIL TEMPLATE

```typescript
export function buildEmailHTML(
  analysis: ContrivoxAnalysis,
  lang: string
): string {
  const scoreColors: Record<string, string> = {
    Fair: "#22c55e", Acceptable: "#84cc16", Concerning: "#eab308",
    Unfair: "#f97316", Dangerous: "#ef4444",
  };
  const sc = scoreColors[analysis.score_label] ?? "#888";

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width"/>
  <title>Contrivox Report</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#09090f;border-radius:12px 12px 0 0;padding:28px 32px;">
              <table width="100%">
                <tr>
                  <td>
                    <span style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:8px;padding:6px 12px;font-size:18px;font-weight:700;color:#fff;">CV</span>
                    <span style="font-size:22px;font-weight:700;color:#fff;margin-left:10px;vertical-align:middle;">Contrivox</span>
                  </td>
                  <td align="right">
                    <span style="font-size:20px;font-weight:700;color:${sc};">${analysis.score}/100</span><br/>
                    <span style="font-size:12px;color:${sc};text-transform:uppercase;letter-spacing:0.08em;">${analysis.score_label}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contract type banner -->
          <tr>
            <td style="background:${sc};padding:8px 32px;">
              <span style="font-size:12px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.06em;">${analysis.contract_type}</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#fff;padding:32px;">
              <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">${analysis.summary}</p>

              <!-- Score reasoning -->
              <div style="background:#f5f3ff;border-left:3px solid #7c3aed;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
                <p style="font-size:11px;font-weight:700;color:#6d28d9;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 5px;">Score Reasoning</p>
                <p style="font-size:13px;color:#4b5563;margin:0;line-height:1.65;">${analysis.score_reasoning}</p>
              </div>

              <!-- Recommendation -->
              <div style="background:#eff6ff;border:1px solid #bfdbfe;padding:16px;border-radius:8px;margin-bottom:24px;">
                <p style="font-size:11px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px;">💡 Recommendation</p>
                <p style="font-size:14px;color:#1e3a5f;margin:0;line-height:1.7;">${analysis.overall_recommendation}</p>
              </div>

              <!-- Red flags preview -->
              ${analysis.red_flags?.length ? `
              <p style="font-size:12px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.07em;margin:0 0 10px;">🔴 Red Flags (${analysis.red_flags.length})</p>
              ${analysis.red_flags.slice(0, 3).map(f => `
              <div style="border:1px solid #fecaca;background:#fff5f5;border-radius:8px;padding:12px 14px;margin-bottom:8px;">
                <p style="font-size:13px;font-weight:600;color:#991b1b;margin:0 0 4px;">${f.issue}</p>
                <p style="font-size:12px;color:#6b7280;margin:0;">${f.why_it_matters}</p>
              </div>`).join("")}
              ${analysis.red_flags.length > 3 ? `<p style="font-size:12px;color:#9ca3af;margin:0 0 20px;">+ ${analysis.red_flags.length - 3} more in the full PDF report</p>` : ""}
              ` : ""}

              <!-- PDF notice -->
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-top:24px;">
                <p style="font-size:13px;color:#166534;margin:0;">📎 Your complete Contrivox report is attached as a PDF — including all clauses, every red flag with negotiation scripts, and missing protections.</p>
              </div>
            </td>
          </tr>

          <!-- Disclaimer -->
          <tr>
            <td style="background:#f9fafb;border-radius:0 0 12px 12px;padding:16px 32px;border-top:1px solid #e5e7eb;">
              <p style="font-size:10px;color:#9ca3af;line-height:1.6;margin:0;">${analysis.disclaimer}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
```

---

## WHATSAPP DEEP LINK

```typescript
export function buildWhatsAppLink(
  phone: string,
  analysis: ContrivoxAnalysis,
  t: Translation
): string {
  const clean = phone.replace(/\D/g, "");
  const scoreLabel = t.score_label_map?.[analysis.score_label] ?? analysis.score_label;
  const message =
    `📋 *Contrivox — ${analysis.contract_type}*\n\n` +
    `⚖️ ${t.score_lbl}: *${analysis.score}/100 — ${scoreLabel}*\n\n` +
    `💡 ${analysis.overall_recommendation}\n\n` +
    `🔴 ${t.tab_flags}: ${analysis.red_flags?.length ?? 0}\n` +
    `📌 ${t.tab_clauses}: ${analysis.key_clauses?.length ?? 0}\n\n` +
    `_${analysis.disclaimer}_`;
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
```

---

## RATE LIMITING

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const emailRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1h"),
  prefix: "cvx:email",
});

// Usage in route:
const ip = req.headers.get("x-forwarded-for") ?? "unknown";
const { success, reset } = await emailRateLimit.limit(ip);
if (!success) {
  return Response.json(
    { error: "rate_limited" },
    { status: 429, headers: { "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)) } }
  );
}
```

---

## ENV VARS REQUIRED

```bash
# .env.example
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=reports@contrivox.com
```
