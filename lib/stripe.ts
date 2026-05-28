import Stripe from "stripe";

// Singleton — one Stripe instance for the whole app
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
});

export const PLANS = {
  starter_usd: {
    priceId: process.env.STRIPE_PRICE_STARTER_USD!,
    credits: 1,
    amount:  900,
    label:   "Single Analysis",
  },
} as const;

export type PlanKey = keyof typeof PLANS;
