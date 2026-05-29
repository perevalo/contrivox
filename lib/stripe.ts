import Stripe from "stripe";

// Singleton — one Stripe instance for the whole app
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
});

export const PLANS = {
  basic_usd: {
    priceId: process.env.STRIPE_PRICE_BASIC_USD!,
    credits: 1,
    amount:  900,
    label:   "Basic Analysis",
    tier:    "basic" as const,
  },
  pro_usd: {
    priceId: process.env.STRIPE_PRICE_PRO_USD!,
    credits: 1,
    amount:  2900,
    label:   "Full Report",
    tier:    "pro" as const,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
export type PlanTier = "basic" | "pro";
