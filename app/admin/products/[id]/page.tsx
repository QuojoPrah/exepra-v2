import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { ActionForm, Card, PageHeader } from "@/components/admin/ui";
import { ProductEditor } from "@/components/admin/product-editor";
import { deleteProduct } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Edit product" };

export default async function EditProduct({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const [product, categories, collections, movements] = await Promise.all([
    db.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } }, variants: { orderBy: { sortOrder: "asc" } }, collections: { select: { id: true } } } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.collection.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.inventoryMovement.findMany({ where: { variant: { productId: id } }, orderBy: { createdAt: "desc" }, take: 15, include: { variant: { select: { sku: true } } } }),
  ]);
  if (!product) notFound();
  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ChevronLeft className="h-4 w-4" /> Products</Link>
      <PageHeader title={product.name} description={product.isDemo ? "Demo product from the seed — replace with real catalogue content before launch." : undefined} actions={product.status === "ACTIVE" ? <Link href={`/product/${product.slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm text-bronze-deep hover:underline">View in store <ExternalLink className="h-3.5 w-3.5" /></Link> : null} />
      <ProductEditor
        categories={categories}
        collections={collections}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          details: product.details ?? "",
          careInfo: product.careInfo ?? "",
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          vatRate: product.vatRate,
          categoryId: product.categoryId,
          collectionIds: product.collections.map((c) => c.id),
          status: product.status,
          isFeatured: product.isFeatured,
          isBestSeller: product.isBestSeller,
          badge: product.badge ?? "",
          images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
          variants: product.variants,
        }}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card title="Inventory log">
          {movements.length === 0 ? <p className="text-sm text-muted">No stock movements.</p> : (
            <ul className="divide-y divide-line text-sm">
              {movements.map((m) => (
                <li key={m.id} className="flex justify-between gap-3 py-2"><span>{m.variant.sku} · {m.reason.replace(/_/g, " ").toLowerCase()}{m.note && <span className="text-muted"> — {m.note}</span>}</span><span className={m.delta < 0 ? "text-danger" : "text-success"}>{m.delta > 0 ? "+" : ""}{m.delta}</span><span className="text-xs text-muted">{formatDate(m.createdAt, { dateStyle: "short", timeStyle: "short" })}</span></li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Delete product">
          <ActionForm action={deleteProduct} submitLabel="Delete product" variant="danger" confirm="Delete this product? If it appears in orders it will be archived instead.">
            <input type="hidden" name="id" value={product.id} />
            <p className="text-sm text-muted">Products that appear in past orders are archived rather than deleted, to keep order records intact.</p>
          </ActionForm>
        </Card>
      </div>
    </div>
  );
}
