import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { PaymentPoller } from "@/components/checkout/payment-poller";
import { CartRefresher } from "@/components/checkout/cart-refresher";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { vatNote } from "@/components/ui/vat-note";
import { FALLBACK_IMAGE } from "@/lib/site";
import type { AddressSnapshot } from "@/lib/orders";

export const metadata: Metadata = { title: "Order confirmation", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Shows the order status as recorded by the payment webhook. Returning to this
 * page never marks an order as paid by itself.
 */
export default async function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const { session_id } = await searchParams;
  const order =
    typeof session_id === "string" && session_id.startsWith("cs_")
      ? await db.order.findUnique({ where: { stripeSessionId: session_id }, include: { items: true, payments: true } })
      : null;

  if (!order) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-semibold">We couldn&apos;t find this order</h1>
        <p className="mt-2 max-w-md text-muted">If you completed a payment, you&apos;ll receive a confirmation email shortly. You can also check your order status on the tracking page.</p>
        <LinkButton href="/track-order" className="mt-8">
          Track an order
        </LinkButton>
      </div>
    );
  }

  const paid = order.paymentStatus === "PAID" || ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status);
  const processing = !paid && order.status === "PENDING" && order.payments.length > 0;
  const failed = order.status === "CANCELLED" || order.paymentStatus === "FAILED";
  const awaitingWebhook = !paid && !processing && !failed;
  const address = order.shippingAddress as unknown as AddressSnapshot;

  return (
    <div className="container-page max-w-3xl py-12 sm:py-16">
      {paid && <CartRefresher />}
      {awaitingWebhook && <PaymentPoller />}
      <div className="text-center">
        {paid ? (
          <CheckCircle2 className="mx-auto h-14 w-14 text-success" aria-hidden />
        ) : failed ? (
          <XCircle className="mx-auto h-14 w-14 text-danger" aria-hidden />
        ) : (
          <Clock3 className="mx-auto h-14 w-14 text-bronze-deep" aria-hidden />
        )}
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">
          {paid ? `Thank you, ${order.firstName}!` : failed ? "Payment not completed" : processing ? "Your payment is processing" : "Confirming your payment…"}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-muted" role="status">
          {paid
            ? `Your order ${order.orderNumber} is confirmed. We've sent a confirmation to ${order.email}.`
            : failed
              ? "This order was cancelled because the payment didn't go through. You have not been charged."
              : processing
                ? `We've received order ${order.orderNumber}. Your payment method takes a little longer to confirm — we'll email ${order.email} as soon as it's complete.`
                : "We're waiting for confirmation from our payment provider. This usually takes a few seconds."}
        </p>
      </div>

      <section className="mt-12 rounded-[var(--radius-card)] border border-line bg-white p-6 sm:p-8" aria-label="Order details">
        <div className="flex flex-wrap justify-between gap-4 border-b border-line pb-5 text-sm">
          <div>
            <p className="text-muted">Order number</p>
            <p className="font-semibold">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-muted">Delivery</p>
            <p className="font-medium">{order.shippingLabel}</p>
          </div>
          <div>
            <p className="text-muted">Total</p>
            <p className="font-semibold">{formatPrice(order.total)}</p>
          </div>
        </div>
        <ul className="divide-y divide-line">
          {order.items.map((i) => (
            <li key={i.id} className="flex gap-4 py-4">
              <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
                <Image src={i.image ?? FALLBACK_IMAGE} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <div className="flex-1 text-sm">
                <Link href={`/product/${i.productSlug}`} className="font-medium hover:text-bronze-deep">
                  {i.productName}
                </Link>
                {i.variantLabel && <p className="text-muted">{i.variantLabel}</p>}
                <p className="text-muted">Qty {i.quantity}</p>
              </div>
              <p className="text-sm tabular-nums">{formatPrice(i.lineTotal)}</p>
            </li>
          ))}
        </ul>
        <div className="grid gap-6 border-t border-line pt-5 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium">Shipping to</p>
            <p className="mt-1 text-muted">
              {address.firstName} {address.lastName}
              <br />
              {address.street} {address.houseNumber}
              <br />
              {address.postalCode} {address.city}, {address.country}
            </p>
          </div>
          <dl className="space-y-1.5">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount</dt>
                <dd>−{formatPrice(order.discountTotal)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd>{order.shippingTotal ? formatPrice(order.shippingTotal) : "Free"}</dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
            <p className="text-xs text-muted">{vatNote(order.taxTotal)}</p>
          </dl>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <LinkButton href="/shop" variant="outline">
          Continue shopping
        </LinkButton>
        {order.userId ? <LinkButton href={`/account/orders/${order.orderNumber}`}>View order</LinkButton> : <LinkButton href="/account/register">Create an account</LinkButton>}
      </div>
    </div>
  );
}
