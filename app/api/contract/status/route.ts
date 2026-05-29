import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const limited = await checkRateLimit(req, "contractStatus");
  if (limited) return limited;

  const stripeSession = req.nextUrl.searchParams.get("stripe_session");
  if (!stripeSession || !/^cs_(test|live)_[A-Za-z0-9]{20,200}$/.test(stripeSession)) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("contract_session_id")
    .eq("stripe_session_id", stripeSession)
    .single();

  if (!payment?.contract_session_id) {
    // Payment not yet recorded — webhook is still in flight
    return NextResponse.json({ status: "pending" });
  }

  const { data: contract } = await supabase
    .from("contracts")
    .select("status, analysis, report_tier, session_id")
    .eq("session_id", payment.contract_session_id)
    .single();

  return NextResponse.json({
    status:              (contract?.status ?? "pending") as "pending" | "done" | "error",
    analysis:            contract?.status === "done" ? (contract.analysis ?? null) : null,
    report_tier:         (contract?.report_tier ?? "basic") as "basic" | "full",
    contract_session_id: contract?.session_id ?? null,
  });
}
