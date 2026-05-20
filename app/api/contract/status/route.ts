import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const stripeSession = req.nextUrl.searchParams.get("stripe_session");
  if (!stripeSession) {
    return NextResponse.json({ error: "Missing stripe_session" }, { status: 400 });
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
    .select("status")
    .eq("session_id", payment.contract_session_id)
    .single();

  return NextResponse.json({
    status: (contract?.status ?? "pending") as "pending" | "done" | "error",
  });
}
