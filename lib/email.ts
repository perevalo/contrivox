import { Resend } from "resend";
import type { ContrivoxAnalysis } from "./validation";

const resend = new Resend(process.env.RESEND_API_KEY!);

// Add subjects here as new output languages are enabled.
const SUBJECTS: Record<string, string> = {
  en: "Your contract decoded — Contrivox report inside",
};

const SCORE_COLORS: Record<string, string> = {
  Fair: "#22c55e", Acceptable: "#84cc16", Concerning: "#eab308",
  Unfair: "#f97316", Dangerous: "#ef4444",
};

export async function sendReportEmail({
  to,
  analysis,
  pdfBase64,
  language,
}: {
  to: string;
  analysis: ContrivoxAnalysis;
  pdfBase64?: string;
  language: string;
}): Promise<{ id?: string; error?: string }> {
  const subject = `${SUBJECTS[language] ?? SUBJECTS.en} — ${analysis.contract_type}`;
  const sc = SCORE_COLORS[analysis.score_label] ?? "#888";

  const attachments = pdfBase64
    ? [{ filename: "Contrivox-Report.pdf", content: Buffer.from(pdfBase64, "base64"), contentType: "application/pdf" as const }]
    : [];

  const { data, error } = await resend.emails.send({
    from: `Contrivox <${process.env.RESEND_FROM_EMAIL ?? "reports@contrivox.com"}>`,
    to,
    subject,
    html: buildEmailHTML(analysis, sc),
    attachments,
  });

  if (error) return { error: error.message };
  return { id: data?.id };
}

function buildEmailHTML(analysis: ContrivoxAnalysis, sc: string): string {
  const urgencyColor: Record<string, string> = { high: "#dc2626", medium: "#d97706", low: "#6b7280" };
  const flagsHtml = (analysis.red_flags ?? []).slice(0, 3).map((f, i) => {
    const uc = urgencyColor[(f as { urgency?: string }).urgency ?? "medium"] ?? "#d97706";
    return `
    <div style="border:1px solid #fecaca;background:#fff5f5;border-radius:8px;padding:12px 14px;margin-bottom:8px;">
      <p style="font-size:13px;font-weight:600;color:#991b1b;margin:0 0 4px;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${uc};margin-right:6px;vertical-align:middle;"></span>
        ${i + 1}. ${f.issue}
      </p>
      <p style="font-size:12px;color:#6b7280;margin:0;line-height:1.6;">${f.why_it_matters}</p>
    </div>`;
  }).join("");

  const moreFlags = (analysis.red_flags?.length ?? 0) > 3
    ? `<p style="font-size:12px;color:#9ca3af;margin:4px 0 20px;">+ ${(analysis.red_flags?.length ?? 0) - 3} more in the full PDF</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="background:#09090f;border-radius:12px 12px 0 0;padding:26px 30px;">
    <table width="100%"><tr>
      <td>
        <span style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:8px;padding:5px 11px;font-size:16px;font-weight:700;color:#fff;">CV</span>
        <span style="font-size:20px;font-weight:700;color:#fff;margin-left:9px;vertical-align:middle;">Contrivox</span>
      </td>
      <td align="right">
        <span style="font-size:22px;font-weight:700;color:${sc};">${analysis.score}/100</span><br/>
        <span style="font-size:11px;color:${sc};text-transform:uppercase;letter-spacing:0.08em;">${analysis.score_label}</span>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="background:${sc};padding:7px 30px;">
    <span style="font-size:11px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.06em;">${analysis.contract_type}</span>
  </td></tr>
  <tr><td style="background:#fff;padding:30px;">
    <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 22px;">${analysis.summary}</p>
    <div style="background:#f5f3ff;border-left:3px solid #7c3aed;padding:13px 15px;border-radius:0 8px 8px 0;margin-bottom:22px;">
      <p style="font-size:10px;font-weight:700;color:#6d28d9;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 4px;">Score Reasoning</p>
      <p style="font-size:13px;color:#4b5563;margin:0;line-height:1.65;">${analysis.score_reasoning}</p>
    </div>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;padding:14px;border-radius:8px;margin-bottom:22px;">
      <p style="font-size:10px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 5px;">💡 What you should do</p>
      <p style="font-size:14px;color:#1e3a5f;margin:0;line-height:1.7;">${analysis.overall_recommendation}</p>
    </div>
    ${flagsHtml ? `<p style="font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.07em;margin:0 0 9px;">🔴 Red Flags (${analysis.red_flags?.length})</p>${flagsHtml}${moreFlags}` : ""}
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:13px 15px;margin-top:22px;">
      <p style="font-size:13px;color:#166534;margin:0;">📎 Your complete Contrivox report is attached as a PDF — including all clauses, every red flag with negotiation scripts, and missing protections.</p>
    </div>
  </td></tr>
  <tr><td style="background:#f9fafb;border-radius:0 0 12px 12px;padding:14px 30px;border-top:1px solid #e5e7eb;">
    <p style="font-size:10px;color:#9ca3af;line-height:1.6;margin:0;">${analysis.disclaimer}</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}
