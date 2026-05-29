import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkoutInputSchema } from "@/lib/validation";
import { ZodError } from "zod";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, "checkout");
  if (limited) return limited;

  let input: ReturnType<typeof checkoutInputSchema.parse>;
  try {
    input = checkoutInputSchema.parse(await req.json());
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 422 });
    }
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const planKey = `${input.plan}_usd` as keyof typeof PLANS;
  const plan = PLANS[planKey];
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "https://contrivox.com";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price: plan.priceId,
        quantity: 1,
      }],
      ...(input.plan === "upgrade" ? { payment_method_types: ["card", "link"] as const } : {}),
      metadata: {
        user_id:    input.userId ?? "",
        credits:    String(plan.credits),
        plan:       planKey,
        session_id: input.sessionId ?? "",
      },
      success_url:  `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&plan=${input.plan === "upgrade" ? "upgrade" : plan.tier}`,
      cancel_url:   `${baseUrl}/#upload-sec`,
      allow_promotion_codes: true,
      customer_creation: "always",
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[checkout] Stripe error:", e);
    return NextResponse.json({ error: "Could not create checkout session" }, { status: 502 });
  }
}
