import Stripe from "stripe";

// Singleton — one Stripe instance for the whole app
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
});

export const PLANS = {
  single_usd: { priceId: process.env.STRIPE_PRICE_SINGLE_USD!, credits: 1,  amount: 399  },
  bundle_usd: { priceId: process.env.STRIPE_PRICE_BUNDLE_USD!, credits: 5,  amount: 1499 },
  pro_usd:    { priceId: process.env.STRIPE_PRICE_PRO_USD!,    credits: 20, amount: 3999 },
} as const;

export type PlanKey = keyof typeof PLANS;
