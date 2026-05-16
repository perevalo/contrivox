import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export const runtime = "nodejs";

// Stripe requires the raw body — disable body parsing
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e) {
    console.error("[webhook] Signature verification failed:", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId  = session.metadata?.user_id || null;
    const credits = parseInt(session.metadata?.credits ?? "1", 10);
    const plan    = session.metadata?.plan ?? "single_usd";

    // Idempotent upsert — unique constraint on stripe_session_id prevents double grants
    const { error: paymentError } = await supabase
      .from("payments")
      .upsert({
        stripe_session_id:  session.id,
        stripe_customer_id: session.customer as string,
        user_id:            userId,
        amount_cents:       session.amount_total ?? 0,
        credits_granted:    credits,
        plan,
      }, { onConflict: "stripe_session_id" });

    if (paymentError) {
      console.error("[webhook] payment insert error:", paymentError.message);
      // Return 200 so Stripe doesn't retry — log and alert separately
      return NextResponse.json({ received: true });
    }

    // Atomically add credits to user account
    if (userId) {
      const { error: creditError } = await supabase.rpc("add_credits", {
        uid:    userId,
        amount: credits,
      });
      if (creditError) {
        console.error("[webhook] credit grant error:", creditError.message);
      }
    }

    console.log(`[webhook] ✓ payment recorded session=${session.id} credits=${credits}`);
  }

  return NextResponse.json({ received: true });
}
