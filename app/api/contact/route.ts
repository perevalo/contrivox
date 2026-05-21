import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY!);

const schema = z.object({
  name:    z.string().min(1).max(100),
  email:   z.string().email().max(254),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
});

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, "contact");
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { name, email, subject, message } = parsed.data;

  const { error } = await resend.emails.send({
    from:     `Contrivox Contact <${process.env.RESEND_FROM_EMAIL ?? "reports@contrivox.com"}>`,
    to:       "contact@contrivox.com",
    reply_to: email,
    subject:  `[Contact] ${subject}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="margin:0 0 16px;color:#1f2937;">New contact form message</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:80px;">From</td><td style="padding:8px 0;font-size:14px;color:#111827;">${name} &lt;${email}&gt;</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Subject</td><td style="padding:8px 0;font-size:14px;color:#111827;">${subject}</td></tr>
        </table>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
          <p style="font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;margin:0;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </div>
        <p style="font-size:12px;color:#9ca3af;margin-top:20px;">Reply directly to this email to respond to ${name}.</p>
      </div>
    `,
  });

  if (error) {
    console.error("[contact] resend error:", error.message);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
