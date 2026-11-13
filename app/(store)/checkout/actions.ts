"use server";

import { db } from "@/lib/db";
import { buildCartView, resolveCart } from "@/lib/cart";
import { createPendingOrder, OrderError, releaseOrder } from "@/lib/orders";
import { getStripe, isStripeConfigured } from "@/lib/payments/stripe";
import { getSession } from "@/lib/session";
import { getClientIp, rateLimit } from "@/lib/security";
import { getShippingRules } from "@/lib/settings";
import { shippingOptionsFor } from "@/lib/pricing";
import { siteUrl } from "@/lib/site";
import { checkoutSchema, fieldErrors, SUPPORTED_COUNTRIES } from "@/lib/validation";

export type Quote = {
  options: { code: string; name: string; description: string | null; price: number; minDays: number; maxDays: number }[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  selected: string | null;
};

export async function quoteCheckout(country: string, shippingCode: string | null): Promise<Quote | { error: string }> {
  if (!SUPPORTED_COUNTRIES.some((c) => c.code === country)) return { error: "We don't deliver to this country yet." };
  const cart = await resolveCart();
  const view = await buildCartView(cart?.id, { country, shippingCode });
  const options = shippingOptionsFor(await getShippingRules(), country, view.subtotal - view.discount);
  return {
    options: options.map((o) => ({ code: o.code, name: o.name, description: o.description, price: o.price, minDays: o.minDays, maxDays: o.maxDays })),
    subtotal: view.subtotal,
    discount: view.discount,
    shipping: view.shipping,
    tax: view.tax,
    total: view.total,
    selected: view.shippingOption?.code ?? null,
  };
}

export type StartCheckoutResult = { url: string } | { error: string; fieldErrors?: Record<string, string> };

export async function startCheckout(raw: unknown): Promise<StartCheckoutResult> {
  const ip = await getClientIp();
  if (!(await rateLimit("checkout", ip, 10, 600))) {
    return { error: "Too many checkout attempts. Please wait a few minutes and try again." };
  }

  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) return { error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };

  if (!isStripeConfigured()) {
    return { error: "Online payment is not available yet. Please contact us to complete your order." };
  }

  const session = await getSession();
  const cart = await resolveCart();
  if (!cart) return { error: "Your bag is empty." };

  let order;
  try {
    order = await createPendingOrder(parsed.data, { cartId: cart.id, userId: session?.user.id ?? null });
  } catch (err) {
    if (err instanceof OrderError) return { error: err.message };
    console.error("[checkout] order creation failed", err);
    return { error: "We couldn't create your order. Please try again." };
  }

  try {
    const stripe = getStripe();
    const absolute = (url: string | null) => (url && url.startsWith("http") ? url : url ? siteUrl(url) : undefined);
    const httpsImages = (url: string | null) => {
      const a = absolute(url);
      return a?.startsWith("https://") ? [a] : undefined;
    };

    let discounts: { coupon: string }[] | undefined;
    if (order.discountTotal > 0) {
      const coupon = await stripe.coupons.create(
        { amount_off: order.discountTotal, currency: "eur", duration: "once", max_redemptions: 1, name: order.couponCode ?? "Discount" },
        { idempotencyKey: `coupon-${order.id}` },
      );
      discounts = [{ coupon: coupon.id }];
    }

    const checkout = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: order.email,
        client_reference_id: order.id,
        locale: "auto",
        line_items: order.items.map((i) => ({
          quantity: i.quantity,
          price_data: {
            currency: "eur",
            unit_amount: i.unitPrice,
            product_data: { name: i.productName, description: i.variantLabel ?? undefined, images: httpsImages(i.image), metadata: { sku: i.sku } },
          },
        })),
        discounts,
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              display_name: order.shippingLabel,
              fixed_amount: { amount: order.shippingTotal, currency: "eur" },
            },
          },
        ],
        metadata: { orderId: order.id, orderNumber: order.orderNumber },
        payment_intent_data: { metadata: { orderId: order.id, orderNumber: order.orderNumber } },
        success_url: siteUrl("/checkout/success?session_id={CHECKOUT_SESSION_ID}"),
        cancel_url: siteUrl(`/checkout?cancelled=${encodeURIComponent(order.orderNumber)}`),
        expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      },
      { idempotencyKey: `checkout-${order.id}` },
    );

    if (checkout.amount_total !== null && checkout.amount_total !== order.total) {
      console.error(`[checkout] Stripe total ${checkout.amount_total} differs from order total ${order.total} for ${order.orderNumber}`);
    }

    await db.order.update({ where: { id: order.id }, data: { stripeSessionId: checkout.id } });
    if (!checkout.url) throw new Error("Stripe did not return a checkout URL");
    return { url: checkout.url };
  } catch (err) {
    console.error("[checkout] Stripe session failed", err);
    await releaseOrder(order.id, { reason: "Payment session could not be created", by: "system" }).catch(() => undefined);
    return { error: "We couldn't connect to our payment provider. Your card has not been charged — please try again." };
  }
}

/** Called when the customer returns from Stripe via "back": frees reserved stock immediately. */
export async function cancelPendingCheckout(orderNumber: string) {
  const cart = await resolveCart();
  if (!cart) return;
  const order = await db.order.findUnique({ where: { orderNumber }, include: { payments: true } });
  if (!order || order.cartId !== cart.id || order.status !== "PENDING" || order.payments.length > 0 || order.stockReleased) return;
  if (order.stripeSessionId && isStripeConfigured()) {
    try {
      const s = await getStripe().checkout.sessions.retrieve(order.stripeSessionId);
      if (s.status === "complete") return; // paid after all — webhook will handle it
      if (s.status === "open") await getStripe().checkout.sessions.expire(order.stripeSessionId);
    } catch (err) {
      console.error("[checkout] could not expire session", err);
      return;
    }
  }
  await releaseOrder(order.id, { reason: "Customer returned from payment page without paying", by: "customer" });
}
