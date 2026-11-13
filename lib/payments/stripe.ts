import "server-only";
import Stripe from "stripe";

let stripe: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
  }
  stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY, {
    appInfo: { name: "EXEPRA Store" },
    maxNetworkRetries: 2,
  });
  return stripe;
}
