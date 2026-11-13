import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { releaseOrder } from "@/lib/orders";
import { getStripe, isStripeConfigured } from "@/lib/payments/stripe";

export const dynamic = "force-dynamic";

/**
 * Safety net for abandoned checkouts: releases stock held by PENDING orders
 * with no payment after 90 minutes (Stripe sessions expire after ~31 min and
 * normally trigger checkout.session.expired). Scheduled via vercel.json.
 */
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stale = await db.order.findMany({
    where: { status: "PENDING", paymentStatus: "UNPAID", stockReleased: false, payments: { none: {} }, createdAt: { lt: new Date(Date.now() - 90 * 60 * 1000) } },
    select: { id: true, stripeSessionId: true },
    take: 100,
  });
  let released = 0;
  for (const order of stale) {
    if (order.stripeSessionId && isStripeConfigured()) {
      try {
        const s = await getStripe().checkout.sessions.retrieve(order.stripeSessionId);
        if (s.status === "complete") continue; // webhook pending — leave for it
        if (s.status === "open") await getStripe().checkout.sessions.expire(order.stripeSessionId);
      } catch (err) {
        console.error("[cron] stripe lookup failed", order.id, err);
        continue;
      }
    }
    await releaseOrder(order.id, { reason: "Checkout abandoned — stock released", by: "system" });
    released++;
  }
  return NextResponse.json({ checked: stale.length, released });
}
