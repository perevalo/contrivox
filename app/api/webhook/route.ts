import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getPostHogServer } from "@/lib/posthog";
import { analyseContract, type FilePayload } from "@/lib/claude";
import { sendReportEmail } from "@/lib/email";
import Stripe from "stripe";

export const runtime = "nodejs";
export const maxDuration = 60;

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

    const userId            = session.metadata?.user_id || null;
    const credits           = parseInt(session.metadata?.credits ?? "1", 10);
    const plan              = session.metadata?.plan ?? "single_usd";
    const contractSessionId = session.metadata?.session_id || null;

    // Idempotent upsert — unique constraint on stripe_session_id prevents double grants
    const { error: paymentError } = await supabase
      .from("payments")
      .upsert({
        stripe_session_id:    session.id,
        stripe_customer_id:   session.customer as string,
        user_id:              userId,
        amount_cents:         session.amount_total ?? 0,
        credits_granted:      credits,
        plan,
        contract_session_id:  contractSessionId,
      }, { onConflict: "stripe_session_id" });

    if (paymentError) {
      console.error("[webhook] payment insert error:", paymentError.message);
      return NextResponse.json({ received: true });
    }

    if (userId) {
      const { error: creditError } = await supabase.rpc("add_credits", {
        uid:    userId,
        amount: credits,
      });
      if (creditError) {
        console.error("[webhook] credit grant error:", creditError.message);
      }
    }


    const ph = getPostHogServer();
    const distinctId = userId ?? session.customer_details?.email ?? session.id;
    ph.capture({
      distinctId,
      event: "purchase_completed",
      properties: {
        value:             (session.amount_total ?? 0) / 100,
        currency:          (session.currency ?? "usd").toUpperCase(),
        credits,
        plan,
        stripe_session_id: session.id,
      },
    });
    if (userId) {
      ph.groupIdentify({ groupType: "plan", groupKey: plan, properties: { plan } });
    }
    await ph.shutdown();

    // Fire real analysis in background — do not await (webhook must return 200 immediately)
    // NOTE: On Vercel serverless, background work after response may be truncated.
    // For guaranteed execution, migrate to a Supabase DB webhook or queue trigger.
    if (contractSessionId) {
      const customerEmail = session.customer_details?.email ?? null;
      triggerRealAnalysis(contractSessionId, customerEmail).catch(e =>
        console.error("[webhook] triggerRealAnalysis error:", e)
      );
    }
  }

  return NextResponse.json({ received: true });
}

async function triggerRealAnalysis(contractSessionId: string, customerEmail: string | null): Promise<void> {
  const supabase = createSupabaseServiceClient();

  const { data: contract, error: fetchError } = await supabase
    .from("contracts")
    .select("session_id, file_type, file_storage_path, file_text, media_type")
    .eq("session_id", contractSessionId)
    .single();

  if (fetchError || !contract) {
    console.error("[analysis] contract not found:", contractSessionId, fetchError?.message);
    return;
  }

  // Build file payload
  let payload: FilePayload;

  if (contract.file_type === "text") {
    if (!contract.file_text) {
      console.error("[analysis] missing file_text for:", contractSessionId);
      return;
    }
    payload = { type: "text", text: contract.file_text };
  } else {
    if (!contract.file_storage_path) {
      console.error("[analysis] missing storage path for:", contractSessionId);
      return;
    }
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from("contracts")
      .download(contract.file_storage_path);

    if (downloadError || !fileBlob) {
      console.error("[analysis] storage download error:", downloadError?.message);
      return;
    }

    const base64 = Buffer.from(await fileBlob.arrayBuffer()).toString("base64");

    if (contract.file_type === "pdf") {
      payload = { type: "pdf", data: base64 };
    } else {
      payload = { type: "image", data: base64, mediaType: contract.media_type ?? "image/jpeg" };
    }
  }

  // Run Claude analysis
  let analysis;
  try {
    analysis = await analyseContract(payload);
  } catch (e) {
    console.error("[analysis] Claude error for:", contractSessionId, e);
    await supabase
      .from("contracts")
      .update({ status: "error" })
      .eq("session_id", contractSessionId);
    return;
  }

  // Persist real analysis and mark done
  const { error: updateError } = await supabase
    .from("contracts")
    .update({ analysis, status: "done" })
    .eq("session_id", contractSessionId);

  if (updateError) {
    console.error("[analysis] db update error:", updateError.message);
  }

  if (customerEmail) {
    const attempt = await sendReportEmail({ to: customerEmail, analysis });
    if (attempt.error) {
      console.error("[email] first attempt failed:", attempt.error, "— retrying in 5s for session:", contractSessionId);
      await new Promise(r => setTimeout(r, 5000));
      const retry = await sendReportEmail({ to: customerEmail, analysis });
      if (retry.error) {
        console.error("[email] retry failed for session:", contractSessionId, retry.error);
      } else {
        console.log("[email] report sent (retry) to:", customerEmail);
      }
    } else {
      console.log("[email] report sent to:", customerEmail);
    }
  }
}
