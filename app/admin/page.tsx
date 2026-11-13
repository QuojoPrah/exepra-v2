import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, PageHeader } from "@/components/admin/ui";
import { StatusBadge } from "@/components/ui/status-badge";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { integrationStatus } from "@/lib/settings";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

const PAID = ["PAID", "PARTIALLY_REFUNDED"] as const;

function last30Days() {
  const now = Date.now();
  return {
    since: new Date(now - 30 * 864e5),
    days: Array.from({ length: 30 }, (_, i) => new Date(now - (29 - i) * 864e5).toISOString().slice(0, 10)),
  };
}

export default async function AdminDashboard() {
  const { since, days } = last30Days();
  const [revenue, refunds, paidCount, customers, recent, bestSellers, lowStock, daily, pendingReviews, openMessages] = await Promise.all([
    db.order.aggregate({ where: { paymentStatus: { in: [...PAID, "REFUNDED"] } }, _sum: { total: true } }),
    db.payment.aggregate({ _sum: { refundedAmount: true } }),
    db.order.count({ where: { paymentStatus: { in: [...PAID] } } }),
    db.user.count({ where: { role: "customer" } }),
    db.order.findMany({ where: { NOT: { status: "PENDING", payments: { none: {} } } }, orderBy: { createdAt: "desc" }, take: 8 }),
    db.product.findMany({ where: { salesCount: { gt: 0 } }, orderBy: { salesCount: "desc" }, take: 5, select: { id: true, name: true, salesCount: true } }),
    db.productVariant.findMany({ where: { isActive: true, stock: { lte: 3 }, product: { status: "ACTIVE" } }, orderBy: { stock: "asc" }, take: 8, include: { product: { select: { id: true, name: true } } } }),
    db.order.findMany({ where: { paidAt: { gte: since }, paymentStatus: { in: [...PAID, "REFUNDED"] } }, select: { paidAt: true, total: true } }),
    db.review.count({ where: { status: "PENDING" } }),
    db.contactMessage.count({ where: { handled: false } }),
  ]);

  const gross = revenue._sum.total ?? 0;
  const net = gross - (refunds._sum.refundedAmount ?? 0);
  const aov = paidCount ? Math.round(gross / paidCount) : 0;

  const byDay = new Map(days.map((d) => [d, 0]));
  daily.forEach((o) => {
    const key = o.paidAt!.toISOString().slice(0, 10);
    if (byDay.has(key)) byDay.set(key, byDay.get(key)! + o.total);
  });
  const series = [...byDay.entries()];
  const max = Math.max(1, ...series.map(([, v]) => v));
  const status = integrationStatus();

  const stats = [
    { label: "Net sales", value: formatPrice(net), hint: `${formatPrice(gross)} gross` },
    { label: "Paid orders", value: paidCount.toLocaleString("de-DE") },
    { label: "Customers", value: customers.toLocaleString("de-DE"), hint: "registered accounts" },
    { label: "Average order value", value: formatPrice(aov) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="An overview of your store." />

      {(!status.stripe || !status.stripeWebhook || !status.email || !status.imageStorage) && (
        <div className="flex gap-3 rounded-2xl border border-[#c9a24a] bg-[#fff8e6] p-4 text-sm text-[#5c4410]">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Setup incomplete</p>
            <p className="mt-1">Some integrations aren&apos;t configured yet — see <Link href="/admin/settings" className="underline">Settings → Integrations</Link>. The store cannot take real orders until Stripe and email are configured and the legal pages are completed.</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs uppercase tracking-wider text-muted">{s.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{s.value}</p>
            {s.hint && <p className="mt-1 text-xs text-muted">{s.hint}</p>}
          </div>
        ))}
      </div>

      <Card title="Sales — last 30 days">
        <div className="flex h-44 items-end gap-1" role="img" aria-label={`Daily paid sales over the last 30 days, peak ${formatPrice(max)}`}>
          {series.map(([day, value]) => (
            <div key={day} className="group relative flex-1">
              <div className="w-full rounded-t bg-bronze/70 transition group-hover:bg-bronze-deep" style={{ height: `${Math.max(2, (value / max) * 160)}px` }} />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[11px] text-white group-hover:block">
                {formatDate(day, { day: "2-digit", month: "short" })}: {formatPrice(value)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted">
          <span>{formatDate(series[0][0], { day: "2-digit", month: "short" })}</span>
          <span>Today</span>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card title="Recent orders" actions={<Link href="/admin/orders" className="text-sm text-bronze-deep hover:underline">View all</Link>}>
          {recent.length === 0 ? (
            <p className="text-sm text-muted">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <tbody className="divide-y divide-line">
                  {recent.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3"><Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.orderNumber}</Link><p className="text-xs text-muted">{o.firstName} {o.lastName}</p></td>
                      <td className="py-3 text-muted">{formatDate(o.createdAt)}</td>
                      <td className="py-3"><StatusBadge status={o.status} /></td>
                      <td className="py-3 text-right font-medium tabular-nums">{formatPrice(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <div className="space-y-6">
          <Card title="Needs attention">
            <ul className="space-y-2 text-sm">
              <li><Link href="/admin/reviews?status=PENDING" className="hover:underline">{pendingReviews} review{pendingReviews === 1 ? "" : "s"} awaiting moderation</Link></li>
              <li><Link href="/admin/messages" className="hover:underline">{openMessages} unanswered message{openMessages === 1 ? "" : "s"}</Link></li>
            </ul>
          </Card>
          <Card title="Best sellers">
            {bestSellers.length === 0 ? <p className="text-sm text-muted">No sales yet.</p> : (
              <ol className="space-y-2 text-sm">
                {bestSellers.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3"><Link href={`/admin/products/${p.id}`} className="truncate hover:underline">{p.name}</Link><span className="text-muted">{p.salesCount} sold</span></li>
                ))}
              </ol>
            )}
          </Card>
          <Card title="Low stock">
            {lowStock.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-success"><CheckCircle2 className="h-4 w-4" /> All variants are well stocked.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {lowStock.map((v) => (
                  <li key={v.id} className="flex justify-between gap-3">
                    <Link href={`/admin/products/${v.product.id}`} className="truncate hover:underline">{v.product.name}<span className="text-muted"> · {[v.color, v.size].filter(Boolean).join(" / ") || v.sku}</span></Link>
                    <span className={v.stock === 0 ? "font-medium text-danger" : "text-bronze-deep"}>{v.stock}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
