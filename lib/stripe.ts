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
    popular: false,
  },
  bundle_usd: {
    priceId: process.env.STRIPE_PRICE_BUNDLE_USD!,
    credits: 3,
    amount:  1900,
    label:   "3-Pack",
    popular: true,
  },
  pro_usd: {
    priceId: process.env.STRIPE_PRICE_PRO_USD!,
    credits: 10,
    amount:  4900,
    label:   "Freelancer Pack",
    popular: false,
  },
  annual_usd: {
    priceId: process.env.STRIPE_PRICE_ANNUAL_USD!,
    credits: 999,
    amount:  9900,
    label:   "Annual Unlimited",
    popular: false,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
