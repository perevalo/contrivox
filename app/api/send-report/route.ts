import { NextRequest, NextResponse } from "next/server";
import { sendReportEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendReportInputSchema } from "@/lib/validation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { createHash } from "crypto";
import { ZodError } from "zod";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, "sendReport");
  if (limited) return limited;

  let input: ReturnType<typeof sendReportInputSchema.parse>;
  try {
    input = sendReportInputSchema.parse(await req.json());
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Invalid input", details: e.errors }, { status: 422 });
    }
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { email, analysis, pdfBase64 } = input;
  const rawRefSource = req.headers.get("x-ref-source") ?? "";
  const refSource = /^[a-zA-Z0-9_-]{1,50}$/.test(rawRefSource) ? rawRefSource : "direct";

  // Send email via Resend
  const { id, error } = await sendReportEmail({ to: email, analysis, pdfBase64 });

  if (error) {
    console.error("[send-report] Resend error:", error);
    return NextResponse.json({ error: "Email delivery failed. Please try again." }, { status: 502 });
  }

  // Log delivery with hashed email only — never store plaintext email
  const emailHash = createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
  const supabase  = createSupabaseServiceClient();

  await supabase.from("email_log").insert({
    email_hash:         emailHash,
    resend_id:          id,
    status:             "sent",
    acquisition_source: refSource,
  });

  return NextResponse.json({ ok: true });
}
