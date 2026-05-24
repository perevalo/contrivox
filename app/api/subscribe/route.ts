import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { createHash } from "crypto";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY!);

const schema = z.object({
  email: z.string().email().max(320),
  source: z.string().max(100).default("blog-cta"),
});

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, "subscribe");
  if (limited) return limited;

  let input: z.infer<typeof schema>;
  try { input = schema.parse(await req.json()); }
  catch { return NextResponse.json({ error: "Invalid email" }, { status: 422 }); }

  const emailHash = createHash("sha256").update(input.email.toLowerCase()).digest("hex");
  const supabase  = createSupabaseServiceClient();

  const { error: dbError } = await supabase.from("blog_subscribers").upsert(
    { email_hash: emailHash, acquisition_source: input.source },
    { onConflict: "email_hash" }
  );

  if (dbError) {
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }

  const { error: emailError } = await resend.emails.send({
    from:    `Contrivox <blog@contrivox.com>`,
    to:      input.email,
    subject: "Your free contract checklist",
    html:    buildWelcomeEmail(),
  });

  if (emailError) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function buildWelcomeEmail(): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f4f4f8;margin:0;padding:32px 16px;">
<table width="600" style="max-width:600px;width:100%;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
  <tr><td style="background:#09090f;padding:24px 28px;">
    <span style="font-size:20px;font-weight:700;color:#fff;">Contrivox</span>
    <p style="color:#a78bfa;font-size:13px;margin:4px 0 0;">Your contract. Decoded.</p>
  </td></tr>
  <tr><td style="padding:28px;">
    <h2 style="font-size:20px;margin:0 0 16px;">Your 12-clause contract checklist</h2>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 16px;">Before you sign any US contract, run through this list. These are the 12 clauses that cause the most problems — and the ones lawyers check first.</p>
    <ol style="font-size:14px;color:#4b5563;line-height:2;padding-left:1.5rem;">
      <li>Non-compete clause (scope, duration, geography)</li>
      <li>Arbitration clause (waives your right to sue)</li>
      <li>Intellectual property assignment (who owns your work)</li>
      <li>At-will employment (can you be fired without cause)</li>
      <li>Auto-renewal clause (hidden re-enrollment)</li>
      <li>Limitation of liability cap</li>
      <li>Indemnification clause (who pays if things go wrong)</li>
      <li>Governing law and jurisdiction</li>
      <li>Notice period and termination conditions</li>
      <li>Non-solicitation (employees and clients)</li>
      <li>Exclusivity clause (can you work with others)</li>
      <li>Liquidated damages (penalty clauses)</li>
    </ol>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:16px 0 24px;">Found something concerning? Upload your contract to Contrivox and get a full plain-English analysis in 60 seconds.</p>
    <a href="https://contrivox.com/#upload-sec" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;border-radius:9px;font-size:14px;font-weight:700;">Check My Contract →</a>
  </td></tr>
  <tr><td style="padding:16px 28px;background:#f9fafb;font-size:10px;color:#9ca3af;">Not legal advice. Educational purposes only.</td></tr>
</table>
</body></html>`;
}
