import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { Empty, Pager, SearchBar } from "@/components/admin/table-tools";
import { LinkButton } from "@/components/ui/button";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { FALLBACK_IMAGE } from "@/lib/site";
import type { Prisma, ProductStatus } from "@/lib/generated/prisma/client";

export const metadata = { title: "Products" };
const PER_PAGE = 30;

export default async function AdminProducts({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const status = ["DRAFT", "ACTIVE", "ARCHIVED"].includes(String(sp.status)) ? (sp.status as ProductStatus) : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.ProductWhereInput = {
    ...(status ? { status } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { variants: { some: { sku: { contains: q, mode: "insensitive" } } } }] } : {}),
  };
  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, category: { select: { name: true } }, variants: { select: { stock: true, isActive: true } } },
    }),
  ]);
  return (
    <div>
      <PageHeader title="Products" description={`${total} product${total === 1 ? "" : "s"}`} actions={<LinkButton href="/admin/products/new"><Plus className="h-4 w-4" /> New product</LinkButton>} />
      <SearchBar placeholder="Search by name or SKU" defaultValue={q}>
        <select name="status" defaultValue={status ?? ""} className="field h-10 w-auto" aria-label="Filter by status">
          <option value="">All statuses</option><option value="ACTIVE">Active</option><option value="DRAFT">Draft</option><option value="ARCHIVED">Archived</option>
        </select>
      </SearchBar>
      {products.length === 0 ? <Empty>No products found.</Empty> : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr><th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Stock</th><th className="px-4 py-3 font-medium">Sold</th><th className="px-4 py-3 text-right font-medium">Price</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => {
                const stock = p.variants.filter((v) => v.isActive).reduce((n, v) => n + v.stock, 0);
                return (
                  <tr key={p.id} className="hover:bg-ivory">
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                        <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-cream"><Image src={p.images[0]?.url ?? FALLBACK_IMAGE} alt="" fill sizes="40px" className="object-cover" /></span>
                        <span><span className="font-medium hover:underline">{p.name}</span>{p.isDemo && <span className="ml-2 rounded bg-bronze-tint px-1.5 py-0.5 text-[10px] font-medium text-bronze-deep">DEMO</span>}<span className="block text-xs text-muted">{p.variants.length} variant{p.variants.length === 1 ? "" : "s"}{p.isBestSeller ? " · Best seller" : ""}{p.isFeatured ? " · Featured" : ""}</span></span>
                      </Link>
                    </td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.status === "ACTIVE" ? "bg-success/10 text-success" : p.status === "DRAFT" ? "bg-bronze-tint text-bronze-deep" : "bg-sand text-ink-soft"}`}>{p.status.toLowerCase()}</span></td>
                    <td className="px-4 py-3 text-muted">{p.category?.name ?? "—"}</td>
                    <td className={`px-4 py-3 tabular-nums ${stock === 0 ? "text-danger" : stock <= 5 ? "text-bronze-deep" : ""}`}>{stock}</td>
                    <td className="px-4 py-3 tabular-nums text-muted">{p.salesCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatPrice(p.price)}{p.compareAtPrice && <span className="block text-xs text-muted line-through">{formatPrice(p.compareAtPrice)}</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={page} pageCount={Math.ceil(total / PER_PAGE)} href={(p) => `/admin/products?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), page: String(p) })}`} />
    </div>
  );
}
