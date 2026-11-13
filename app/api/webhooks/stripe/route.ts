import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/payments/stripe";
import { handleStripeEvent } from "@/lib/payments/webhook";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.warn("[stripe-webhook] signature verification failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const seen = await db.webhookEvent.findUnique({ where: { id: event.id } });
  if (seen) return NextResponse.json({ received: true, duplicate: true });

  try {
    await handleStripeEvent(event);
  } catch (err) {
    console.error(`[stripe-webhook] failed to process ${event.type} ${event.id}`, err);
    // Non-2xx makes Stripe retry; handlers are idempotent.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  await db.webhookEvent.create({ data: { id: event.id, type: event.type } }).catch(() => undefined);
  return NextResponse.json({ received: true });
}
