import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { Empty, Pager, SearchBar } from "@/components/admin/table-tools";
import { StatusBadge } from "@/components/ui/status-badge";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { formatDate, ORDER_STATUS_LABEL } from "@/lib/utils";
import type { Prisma, OrderStatus } from "@/lib/generated/prisma/client";

export const metadata = { title: "Orders" };
const PER_PAGE = 25;

export default async function AdminOrders({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const status = typeof sp.status === "string" && sp.status in ORDER_STATUS_LABEL ? (sp.status as OrderStatus) : undefined;
  const showAbandoned = sp.abandoned === "1";
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(showAbandoned || status ? {} : { NOT: { status: "PENDING", payments: { none: {} } } }),
    ...(q ? { OR: [{ orderNumber: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { lastName: { contains: q, mode: "insensitive" } }, { firstName: { contains: q, mode: "insensitive" } }] } : {}),
  };
  const [total, orders] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE, include: { _count: { select: { items: true } } } }),
  ]);
  const href = (p: number) => `/admin/orders?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), page: String(p) })}`;

  return (
    <div>
      <PageHeader title="Orders" description={`${total} order${total === 1 ? "" : "s"}`} />
      <SearchBar placeholder="Order number, email or name" defaultValue={q}>
        <select name="status" defaultValue={status ?? ""} className="field h-10 w-auto" aria-label="Filter by status">
          <option value="">All (excl. unpaid checkouts)</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </SearchBar>
      {orders.length === 0 ? <Empty>No orders found.</Empty> : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr><th className="px-4 py-3 font-medium">Order</th><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Payment</th><th className="px-4 py-3 text-right font-medium">Total</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-ivory">
                  <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.orderNumber}</Link><p className="text-xs text-muted">{o._count.items} item{o._count.items === 1 ? "" : "s"}</p></td>
                  <td className="px-4 py-3">{o.firstName} {o.lastName}<p className="text-xs text-muted">{o.email}</p></td>
                  <td className="px-4 py-3 text-muted">{formatDate(o.createdAt, { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3"><StatusBadge status={o.paymentStatus} kind="payment" /></td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={page} pageCount={Math.ceil(total / PER_PAGE)} href={href} />
      {!showAbandoned && !status && <p className="mt-4 text-xs text-muted"><Link href="/admin/orders?abandoned=1" className="underline">Include unpaid / abandoned checkouts</Link></p>}
    </div>
  );
}
