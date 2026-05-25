import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { createHash } from "crypto";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY!);

const schema = z.object({
  email: z.string().email().max(320),
});

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, "checklist");
  if (limited) return limited;

  let input: z.infer<typeof schema>;
  try {
    input = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid email address." }, { status: 422 });
  }

  const { email } = input;

  // Read the checklist PDF from public/downloads/
  let pdfContent: string;
  try {
    const pdfPath = path.join(process.cwd(), "public", "downloads", "contrivox-12-clauses-checklist.pdf");
    pdfContent = fs.readFileSync(pdfPath).toString("base64");
  } catch (err) {
    console.error("[checklist] Could not read PDF:", err);
    return NextResponse.json({ error: "Checklist temporarily unavailable." }, { status: 500 });
  }

  const { error: emailError } = await resend.emails.send({
    from:    `Contrivox <${process.env.RESEND_FROM_EMAIL ?? "hello@contrivox.com"}>`,
    to:      email,
    subject: "Your free contract checklist — 12 clauses to check before signing",
    html:    buildChecklistEmail(email),
    attachments: [
      {
        filename:    "contrivox-12-clauses-checklist.pdf",
        content:     pdfContent,
        content_type: "application/pdf",
      },
    ],
  });

  if (emailError) {
    console.error("[checklist] Resend error:", emailError);
    return NextResponse.json({ error: "Email delivery failed. Please try again." }, { status: 502 });
  }

  // Log with hashed email only — never store plaintext
  const emailHash = createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
  const supabase  = createSupabaseServiceClient();
  await supabase
    .from("blog_subscribers")
    .upsert({ email_hash: emailHash, acquisition_source: "checklist-cta" }, { onConflict: "email_hash" });

  console.log(`[checklist] Sent to hash ${emailHash.slice(0, 8)}…`);

  return NextResponse.json({ ok: true });
}

function buildChecklistEmail(email: string): string {
  const unsubUrl = `https://contrivox.com/unsubscribe?e=${encodeURIComponent(email)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:32px 16px;background:#f4f2ff;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="600" style="max-width:600px;width:100%;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 16px rgba(124,58,237,0.10);">

  <!-- Header -->
  <tr><td style="background:#09090f;padding:24px 32px;">
    <div style="font-size:18px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">Contrivox</div>
    <div style="font-size:12px;color:#a78bfa;margin-top:3px;">Your contract. Decoded.</div>
  </td></tr>

  <!-- Hero -->
  <tr><td style="padding:32px 32px 20px;">
    <h1 style="margin:0 0 10px;font-size:24px;font-weight:800;color:#0d0b1e;line-height:1.2;">
      Here&rsquo;s your free checklist.
    </h1>
    <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.7;">
      The 12 clauses that cost people thousands — explained in plain English with a checkbox for each one.
      The PDF is attached to this email.
    </p>
  </td></tr>

  <!-- Direct download link -->
  <tr><td style="padding:0 32px 24px;">
    <a href="https://contrivox.com/downloads/contrivox-12-clauses-checklist.pdf"
       style="font-size:13px;color:#7c3aed;text-decoration:underline;">
      Can&rsquo;t open the attachment? Download directly here &rarr;
    </a>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:0 32px 24px;border-top:1px solid #f0ebff;">
    <p style="margin:20px 0 10px;font-size:14px;color:#374151;line-height:1.8;">
      Review this before signing any employment contract, NDA, lease, or freelance agreement.
      If you find a clause you don&rsquo;t understand, upload your contract to Contrivox and
      get a full plain-English analysis in 60 seconds.
    </p>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:0 32px 32px;text-align:center;">
    <a href="https://contrivox.com/#upload-sec"
       style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.2px;">
      Check My Contract &mdash; $9
    </a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:16px 32px;background:#faf8ff;border-top:1px solid #ede9fe;">
    <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
      Contrivox is not a law firm. This checklist is for informational purposes only.
      Consult a qualified attorney before signing any contract.<br/>
      <a href="${unsubUrl}" style="color:#9ca3af;">Unsubscribe</a>
    </p>
  </td></tr>

</table>
</body></html>`;
}
