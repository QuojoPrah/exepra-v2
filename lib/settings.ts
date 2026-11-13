import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

export const getStoreSettings = cache(async () => {
  const existing = await db.storeSettings.findUnique({ where: { id: "store" } });
  if (existing) return existing;
  return db.storeSettings.create({
    data: {
      id: "store",
      announcements: ["Free standard shipping in Germany on orders over 75 €"],
    },
  });
});

export const getShippingRules = cache(async () =>
  db.shippingRate.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
);

export { siteUrl } from "@/lib/site";

export function integrationStatus() {
  return {
    database: Boolean(process.env.DATABASE_URL),
    auth: Boolean(process.env.BETTER_AUTH_SECRET),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    stripeMode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "live" : "test",
    email: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
    imageStorage: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
    analytics: Boolean(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN),
  };
}
