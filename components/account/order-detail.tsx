import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatPrice } from "@/lib/money";
import { vatNote } from "@/components/ui/vat-note";
import { FALLBACK_IMAGE } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import type { AddressSnapshot } from "@/lib/orders";
import type { Prisma } from "@/lib/generated/prisma/client";

type Order = Prisma.OrderGetPayload<{ include: { items: true; history: true } }>;

const STEPS = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

function AddressBlock({ title, a }: { title: string; a: AddressSnapshot }) {
  return (
    <div>
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        {a.company && (
          <>
            {a.company}
            <br />
          </>
        )}
        {a.firstName} {a.lastName}
        <br />
        {a.street} {a.houseNumber}
        {a.addressLine2 && (
          <>
            <br />
            {a.addressLine2}
          </>
        )}
        <br />
        {a.postalCode} {a.city}, {a.country}
        {a.vatId && (
          <>
            <br />
            VAT ID: {a.vatId}
          </>
        )}
      </p>
    </div>
  );
}

/** Customer-facing order detail (used by account and track-order pages). */
export function OrderDetail({ order }: { order: Order }) {
  const stepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const visibleHistory = order.history.filter((h) => h.createdBy !== "system" || h.status !== "PENDING").slice().reverse();
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold sm:text-3xl">Order {order.orderNumber}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="-mt-5 text-sm text-muted">Placed on {formatDate(order.createdAt, { dateStyle: "long" })}</p>

      {stepIndex >= 0 && (
        <ol className="grid grid-cols-4 gap-2" aria-label="Order progress">
          {STEPS.map((s, i) => (
            <li key={s} className="text-xs">
              <span className={`block h-1.5 rounded-full ${i <= stepIndex ? "bg-success" : "bg-sand"}`} aria-hidden />
              <span className={`mt-2 block ${i <= stepIndex ? "font-medium text-ink" : "text-muted"}`}>{s.charAt(0) + s.slice(1).toLowerCase()}</span>
            </li>
          ))}
        </ol>
      )}

      {order.trackingNumber && (
        <div className="rounded-xl border border-line bg-white p-5 text-sm">
          <p className="font-medium">Shipment tracking</p>
          <p className="mt-1 text-muted">
            {order.trackingCarrier ?? "Carrier"} · {order.trackingNumber}
          </p>
          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-medium text-bronze-deep underline underline-offset-2">
              Track your parcel →
            </a>
          )}
        </div>
      )}

      <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 sm:p-6">
        <ul className="divide-y divide-line">
          {order.items.map((i) => (
            <li key={i.id} className="flex gap-4 py-4 first:pt-0">
              <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
                <Image src={i.image ?? FALLBACK_IMAGE} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <div className="flex-1 text-sm">
                <Link href={`/product/${i.productSlug}`} className="font-medium hover:text-bronze-deep">
                  {i.productName}
                </Link>
                {i.variantLabel && <p className="text-muted">{i.variantLabel}</p>}
                <p className="text-muted">
                  {i.quantity} × {formatPrice(i.unitPrice)}
                </p>
              </div>
              <p className="text-sm tabular-nums">{formatPrice(i.lineTotal)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-2 space-y-1.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between text-success">
              <dt>Discount {order.couponCode && `(${order.couponCode})`}</dt>
              <dd>−{formatPrice(order.discountTotal)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">Shipping ({order.shippingLabel})</dt>
            <dd>{order.shippingTotal ? formatPrice(order.shippingTotal) : "Free"}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
          <p className="text-xs text-muted">{vatNote(order.taxTotal)} Payment: <StatusBadge status={order.paymentStatus} kind="payment" /></p>
        </dl>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <AddressBlock title="Shipping address" a={order.shippingAddress as unknown as AddressSnapshot} />
        <AddressBlock title="Billing address" a={order.billingAddress as unknown as AddressSnapshot} />
      </div>

      {visibleHistory.length > 0 && (
        <section>
          <h2 className="font-medium">History</h2>
          <ol className="mt-3 space-y-3 border-l border-line pl-5 text-sm">
            {visibleHistory.map((h) => (
              <li key={h.id}>
                <p className="font-medium">{h.status.charAt(0) + h.status.slice(1).toLowerCase()}</p>
                <p className="text-xs text-muted">{formatDate(h.createdAt, { dateStyle: "medium", timeStyle: "short" })}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
