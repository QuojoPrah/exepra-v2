import "server-only";
import type Stripe from "stripe";
import { markOrderAwaitingPayment, markOrderPaid, recordRefund, releaseOrder } from "@/lib/orders";

function intentId(value: string | Stripe.PaymentIntent | null) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (!orderId) return;
      if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
        await markOrderPaid({
          orderId,
          sessionId: session.id,
          paymentIntentId: intentId(session.payment_intent),
          amount: session.amount_total ?? 0,
          currency: session.currency ?? "eur",
          method: session.payment_method_types?.[0] ?? null,
        });
      } else if (event.type === "checkout.session.completed") {
        await markOrderAwaitingPayment(orderId, session.id, intentId(session.payment_intent), session.amount_total ?? 0);
      }
      return;
    }
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (!orderId) return;
      await releaseOrder(orderId, {
        reason: event.type === "checkout.session.expired" ? "Checkout session expired without payment" : "Payment failed",
        by: "stripe",
      });
      return;
    }
    case "charge.refunded": {
      const charge = event.data.object;
      const pi = intentId(charge.payment_intent);
      if (pi) await recordRefund(pi, charge.amount_refunded);
      return;
    }
    default:
      return;
  }
}
