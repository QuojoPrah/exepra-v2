import type { Metadata } from "next";
import Link from "next/link";
import { Heart, MapPin, Package, UserRound } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { requireUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountPage() {
  const session = await requireUser("/account");
  const [orders, addressCount, wishlist] = await Promise.all([
    db.order.findMany({ where: { userId: session.user.id, NOT: { status: "PENDING", payments: { none: {} } } }, orderBy: { createdAt: "desc" }, take: 3 }),
    db.address.count({ where: { userId: session.user.id } }),
    db.wishlist.findUnique({ where: { userId: session.user.id }, include: { _count: { select: { items: true } } } }),
  ]);
  const cards = [
    { href: "/account/orders", icon: Package, title: "Orders", text: "Track, review and reorder" },
    { href: "/account/profile", icon: UserRound, title: "Profile & security", text: "Name, password, your data" },
    { href: "/account/addresses", icon: MapPin, title: "Addresses", text: `${addressCount} saved` },
    { href: "/wishlist", icon: Heart, title: "Wishlist", text: `${wishlist?._count.items ?? 0} saved items` },
  ];
  return (
    <div>
      <h1 className="text-3xl font-semibold">Hello, {session.user.name.split(" ")[0]}</h1>
      <p className="mt-2 text-muted">Manage your orders, details and preferences.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-white p-5 transition hover:shadow-soft">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream">
                <c.icon className="h-5 w-5 text-bronze-deep" aria-hidden />
              </span>
              <span>
                <span className="block font-medium">{c.title}</span>
                <span className="block text-sm text-muted">{c.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="mt-12 text-xl font-semibold">Recent orders</h2>
      {orders.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          You haven&apos;t placed any orders yet. <Link href="/shop" className="font-medium text-ink underline underline-offset-2">Start shopping</Link>
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/account/orders/${o.orderNumber}`} className="flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-ivory">
                <span>
                  <span className="block font-medium">{o.orderNumber}</span>
                  <span className="block text-sm text-muted">{formatDate(o.createdAt)}</span>
                </span>
                <StatusBadge status={o.status} />
                <span className="font-medium tabular-nums">{formatPrice(o.total)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
