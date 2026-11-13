import { PageHeader } from "@/components/admin/ui";
import { ProductEditor } from "@/components/admin/product-editor";
import { db } from "@/lib/db";

export const metadata = { title: "New product" };

export default async function NewProduct() {
  const [categories, collections] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.collection.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  return (
    <div>
      <PageHeader title="New product" />
      <ProductEditor
        categories={categories}
        collections={collections}
        initial={{ name: "", slug: "", description: "", details: "", careInfo: "", price: null, compareAtPrice: null, vatRate: 19, categoryId: null, collectionIds: [], status: "DRAFT", isFeatured: false, isBestSeller: false, badge: "", images: [], variants: [] }}
      />
    </div>
  );
}
