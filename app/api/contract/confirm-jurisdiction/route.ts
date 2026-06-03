import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { confirmJurisdictionSchema } from "@/lib/validation";
import { SUPPORTED_JURISDICTION_CODES, getJurisdictionName } from "@/lib/jurisdiction";

export const runtime = "nodejs";

export async function PUT(req: NextRequest) {
  const limited = await checkRateLimit(req, "confirmJurisdiction");
  if (limited) return limited;

  let input: ReturnType<typeof confirmJurisdictionSchema.parse>;
  try {
    input = confirmJurisdictionSchema.parse(await req.json());
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 422 });
    }
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!SUPPORTED_JURISDICTION_CODES.includes(input.jurisdictionCode)) {
    return NextResponse.json({ error: "Unsupported jurisdiction" }, { status: 422 });
  }

  const supabase = createSupabaseServiceClient();

  const { error } = await supabase
    .from("contracts")
    .update({
      jurisdiction_code:    input.jurisdictionCode,
      jurisdiction_name:    getJurisdictionName(input.jurisdictionCode),
      detection_confidence: 1.0,
      detection_signals:    ["user_confirmed"],
    })
    .eq("session_id", input.sessionId)
    .in("status", ["pending", "processing"]);

  if (error) {
    console.error("[confirm-jurisdiction] db error:", error.message);
    return NextResponse.json({ error: "Update failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
