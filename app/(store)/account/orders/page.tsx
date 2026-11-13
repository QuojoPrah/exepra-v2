import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { requireUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "My orders", robots: { index: false } };

export default async function OrdersPage() {
  const session = await requireUser("/account/orders");
  const orders = await db.order.findMany({
    where: { userId: session.user.id, NOT: { status: "PENDING", payments: { none: {} } } },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });
  return (
    <div>
      <h1 className="text-3xl font-semibold">Orders</h1>
      {orders.length === 0 ? (
        <p className="mt-4 text-muted">
          No orders yet. <Link href="/shop" className="font-medium text-ink underline underline-offset-2">Discover the shop</Link>
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-ivory">
                  <td className="px-5 py-4">
                    <Link href={`/account/orders/${o.orderNumber}`} className="font-medium underline-offset-2 hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-muted">{formatDate(o.createdAt)}</td>
                  <td className="px-5 py-4"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-4 text-muted">{o._count.items}</td>
                  <td className="px-5 py-4 text-right font-medium tabular-nums">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
