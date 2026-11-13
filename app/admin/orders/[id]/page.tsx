import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ActionForm, Card, Check, F, PageHeader, TA } from "@/components/admin/ui";
import { StatusBadge } from "@/components/ui/status-badge";
import { addOrderNote, refundOrder, updateOrderStatus } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { centsToEuroInput, formatPrice } from "@/lib/money";
import { formatDate, ORDER_STATUS_LABEL } from "@/lib/utils";
import type { AddressSnapshot } from "@/lib/orders";

export const metadata = { title: "Order" };

function Addr({ a }: { a: AddressSnapshot }) {
  return (
    <p className="text-sm leading-relaxed text-ink-soft">
      {a.company && <>{a.company}<br /></>}
      {a.firstName} {a.lastName}<br />
      {a.street} {a.houseNumber}<br />
      {a.addressLine2 && <>{a.addressLine2}<br /></>}
      {a.postalCode} {a.city}, {a.country}
      {a.phone && <><br />{a.phone}</>}
      {a.vatId && <><br />VAT ID: {a.vatId}</>}
    </p>
  );
}

export default async function AdminOrder({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, history: { orderBy: { createdAt: "desc" } }, payments: true, emails: { orderBy: { createdAt: "desc" } }, user: { select: { id: true, name: true } } },
  });
  if (!order) notFound();
  const paid = order.payments.find((p) => p.status === "PAID" || p.status === "PARTIALLY_REFUNDED");
  const refundable = paid ? paid.amount - paid.refundedAmount : 0;
  const canFulfil = order.paymentStatus === "PAID";
  const canCancel = order.paymentStatus !== "PAID" && !["CANCELLED", "REFUNDED"].includes(order.status);

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ChevronLeft className="h-4 w-4" /> Orders</Link>
      <PageHeader
        title={`Order ${order.orderNumber}`}
        description={`Placed ${formatDate(order.createdAt, { dateStyle: "long", timeStyle: "short" })}${order.paidAt ? ` · paid ${formatDate(order.paidAt, { dateStyle: "medium", timeStyle: "short" })}` : ""}`}
        actions={<div className="flex gap-2"><StatusBadge status={order.status} /><StatusBadge status={order.paymentStatus} kind="payment" /></div>}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card title="Items">
            <ul className="divide-y divide-line text-sm">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-4 py-3">
                  <div><p className="font-medium">{i.productName}</p><p className="text-xs text-muted">{[i.variantLabel, `SKU ${i.sku}`].filter(Boolean).join(" · ")}</p></div>
                  <p className="whitespace-nowrap text-right tabular-nums">{i.quantity} × {formatPrice(i.unitPrice)}<br /><span className="font-medium">{formatPrice(i.lineTotal)}</span></p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              {order.discountTotal > 0 && <div className="flex justify-between"><dt className="text-muted">Discount ({order.couponCode})</dt><dd>−{formatPrice(order.discountTotal)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Shipping · {order.shippingLabel}</dt><dd>{formatPrice(order.shippingTotal)}</dd></div>
              <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
              <div className="flex justify-between text-xs text-muted"><dt>VAT included</dt><dd>{formatPrice(order.taxTotal)}</dd></div>
            </dl>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card title="Customer">
              <p className="text-sm">{order.firstName} {order.lastName}</p>
              <p className="text-sm text-muted">{order.email}{order.phone && <><br />{order.phone}</>}</p>
              {order.user ? <Link href={`/admin/customers/${order.user.id}`} className="mt-2 inline-block text-xs text-bronze-deep hover:underline">View customer account →</Link> : <p className="mt-2 text-xs text-muted">Guest checkout</p>}
              {order.customerNote && <p className="mt-3 rounded-lg bg-cream p-3 text-sm">“{order.customerNote}”</p>}
            </Card>
            <Card title="Shipping address"><Addr a={order.shippingAddress as unknown as AddressSnapshot} /></Card>
            <Card title="Billing address"><Addr a={order.billingAddress as unknown as AddressSnapshot} /></Card>
            <Card title="Payments">
              {order.payments.length === 0 ? <p className="text-sm text-muted">No payment recorded.</p> : (
                <ul className="space-y-2 text-sm">
                  {order.payments.map((p) => (
                    <li key={p.id}>
                      <StatusBadge status={p.status} kind="payment" /> {formatPrice(p.amount)}{p.refundedAmount > 0 && <span className="text-muted"> · refunded {formatPrice(p.refundedAmount)}</span>}
                      <p className="break-all text-xs text-muted">{p.providerPaymentId ?? p.checkoutSessionId}{p.method && ` · ${p.method}`}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card title="History">
            <ol className="space-y-3 text-sm">
              {order.history.map((h) => (
                <li key={h.id} className="border-l-2 border-line pl-3">
                  <p><StatusBadge status={h.status} /> <span className="text-xs text-muted">{formatDate(h.createdAt, { dateStyle: "medium", timeStyle: "short" })} · {h.createdBy === "stripe" || h.createdBy === "system" || h.createdBy === "customer" ? h.createdBy : "admin"}</span></p>
                  {h.note && <p className="mt-1 text-ink-soft">{h.note}</p>}
                </li>
              ))}
            </ol>
          </Card>

          <Card title="Emails">
            {order.emails.length === 0 ? <p className="text-sm text-muted">No emails recorded.</p> : (
              <ul className="space-y-1.5 text-sm">
                {order.emails.map((e) => (
                  <li key={e.id} className="flex flex-wrap justify-between gap-2"><span>{e.template}</span><span className={e.status === "sent" ? "text-success" : "text-danger"}>{e.status}{e.error && ` — ${e.error}`}</span><span className="text-xs text-muted">{formatDate(e.createdAt, { dateStyle: "short", timeStyle: "short" })}</span></li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {canFulfil && (
            <Card title="Fulfilment">
              <ActionForm action={updateOrderStatus} submitLabel="Update order">
                <input type="hidden" name="id" value={order.id} />
                <div>
                  <label htmlFor="adm-status" className="label">Status</label>
                  <select id="adm-status" name="status" defaultValue={order.status} className="field h-11">
                    {["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].map((s) => <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>)}
                  </select>
                </div>
                <F label="Carrier" name="trackingCarrier" defaultValue={order.trackingCarrier} placeholder="DHL" />
                <F label="Tracking number" name="trackingNumber" defaultValue={order.trackingNumber} />
                <F label="Tracking URL" name="trackingUrl" type="url" defaultValue={order.trackingUrl} placeholder="https://" />
                <TA label="Note (internal, optional)" name="note" rows={2} />
                <p className="text-xs text-muted">Setting the status to Shipped emails the customer with tracking details.</p>
              </ActionForm>
            </Card>
          )}
          {refundable > 0 && (
            <Card title="Refund">
              <ActionForm action={refundOrder} submitLabel="Issue refund" variant="danger" confirm="Refund this amount to the customer via Stripe?">
                <input type="hidden" name="id" value={order.id} />
                <F label="Amount (€)" name="amount" defaultValue={centsToEuroInput(refundable)} inputMode="decimal" hint={`Up to ${formatPrice(refundable)}`} />
                <Check label="Return items to stock" name="restock" />
              </ActionForm>
            </Card>
          )}
          {canCancel && (
            <Card title="Cancel order">
              <ActionForm action={updateOrderStatus} submitLabel="Cancel order" variant="danger" confirm="Cancel this unpaid order and release its stock?">
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="status" value="CANCELLED" />
                <TA label="Reason (sent to customer)" name="note" rows={2} />
              </ActionForm>
            </Card>
          )}
          <Card title="Add note">
            <ActionForm action={addOrderNote} submitLabel="Add note" variant="outline" resetOnSuccess>
              <input type="hidden" name="id" value={order.id} />
              <TA label="Internal note" name="note" rows={3} />
            </ActionForm>
          </Card>
        </div>
      </div>
    </div>
  );
}
