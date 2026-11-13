import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { Empty, Pager, SearchBar } from "@/components/admin/table-tools";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import type { Prisma } from "@/lib/generated/prisma/client";

export const metadata = { title: "Customers" };
const PER_PAGE = 30;

export default async function AdminCustomers({ searchParams }: PageProps<"/admin/customers">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.UserWhereInput = q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] } : {};
  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
  ]);
  const spend = await db.order.groupBy({ by: ["userId"], where: { userId: { in: users.map((u) => u.id) }, paymentStatus: { in: ["PAID", "PARTIALLY_REFUNDED"] } }, _sum: { total: true }, _count: { _all: true } });
  const byUser = new Map(spend.map((s) => [s.userId, s]));
  return (
    <div>
      <PageHeader title="Customers" description={`${total} account${total === 1 ? "" : "s"}. Guest orders are listed under Orders.`} />
      <SearchBar placeholder="Search by name or email" defaultValue={q} />
      {users.length === 0 ? <Empty>No customers found.</Empty> : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-muted"><tr><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Joined</th><th className="px-4 py-3 font-medium">Orders</th><th className="px-4 py-3 text-right font-medium">Spent</th></tr></thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-ivory">
                  <td className="px-4 py-3"><Link href={`/admin/customers/${u.id}`} className="font-medium hover:underline">{u.name}</Link>{u.role === "admin" && <span className="ml-2 rounded bg-ink px-1.5 py-0.5 text-[10px] text-white">ADMIN</span>}<p className="text-xs text-muted">{u.email}</p></td>
                  <td className="px-4 py-3 text-muted">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">{byUser.get(u.id)?._count._all ?? 0}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPrice(byUser.get(u.id)?._sum.total ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={page} pageCount={Math.ceil(total / PER_PAGE)} href={(p) => `/admin/customers?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`} />
    </div>
  );
}
