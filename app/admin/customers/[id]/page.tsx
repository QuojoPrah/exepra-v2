import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Card, PageHeader } from "@/components/admin/ui";
import { StatusBadge } from "@/components/ui/status-badge";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Customer" };

export default async function AdminCustomer({ params }: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id }, include: { addresses: true, orders: { orderBy: { createdAt: "desc" } }, reviews: { select: { id: true } } } });
  if (!user) notFound();
  const paid = user.orders.filter((o) => o.paymentStatus === "PAID" || o.paymentStatus === "PARTIALLY_REFUNDED");
  return (
    <div className="space-y-6">
      <Link href="/admin/customers" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ChevronLeft className="h-4 w-4" /> Customers</Link>
      <PageHeader title={user.name} description={`${user.email}${user.phone ? ` · ${user.phone}` : ""} · joined ${formatDate(user.createdAt)}${user.emailVerified ? " · email verified" : ""}`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-xs uppercase tracking-wider text-muted">Paid orders</p><p className="mt-1 text-2xl font-semibold">{paid.length}</p></Card>
        <Card><p className="text-xs uppercase tracking-wider text-muted">Total spent</p><p className="mt-1 text-2xl font-semibold">{formatPrice(paid.reduce((n, o) => n + o.total, 0))}</p></Card>
        <Card><p className="text-xs uppercase tracking-wider text-muted">Reviews</p><p className="mt-1 text-2xl font-semibold">{user.reviews.length}</p></Card>
      </div>
      <Card title="Orders">
        {user.orders.length === 0 ? <p className="text-sm text-muted">No orders.</p> : (
          <ul className="divide-y divide-line text-sm">
            {user.orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.orderNumber}</Link><span className="text-muted">{formatDate(o.createdAt)}</span><StatusBadge status={o.status} /><span className="tabular-nums">{formatPrice(o.total)}</span></li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Addresses">
        {user.addresses.length === 0 ? <p className="text-sm text-muted">No saved addresses.</p> : (
          <ul className="grid gap-4 sm:grid-cols-2 text-sm">
            {user.addresses.map((a) => <li key={a.id} className="rounded-xl bg-ivory p-4">{a.firstName} {a.lastName}<br />{a.street} {a.houseNumber}<br />{a.postalCode} {a.city}, {a.country}</li>)}
          </ul>
        )}
      </Card>
      <p className="text-xs text-muted">Customers manage their own profile, addresses and account deletion. For data protection requests, use the customer&apos;s own data export or contact your developer.</p>
    </div>
  );
}
