import { ActionForm, Card, Check, F, ImageField, PageHeader, TA } from "@/components/admin/ui";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { db } from "@/lib/db";

export const metadata = { title: "Categories" };

type Cat = { id?: string; name?: string; slug?: string; description?: string | null; image?: string | null; sortOrder?: number; isActive?: boolean; isFeatured?: boolean };

function CategoryFields({ c }: { c: Cat }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {c.id && <input type="hidden" name="id" value={c.id} />}
      <F label="Name" name="name" defaultValue={c.name} required />
      <F label="URL slug" name="slug" defaultValue={c.slug} hint="Becomes /slug — e.g. /women" />
      <TA label="Description" name="description" defaultValue={c.description} rows={2} className="sm:col-span-2" />
      <div className="sm:col-span-2"><ImageField name="image" label="Banner / card image" defaultValue={c.image} folder="categories" /></div>
      <F label="Sort order" name="sortOrder" type="number" defaultValue={c.sortOrder ?? 0} />
      <div className="space-y-2 pt-6"><Check label="Active (visible in store)" name="isActive" defaultChecked={c.isActive ?? true} /><Check label="Feature on homepage" name="isFeatured" defaultChecked={c.isFeatured} /></div>
    </div>
  );
}

export default async function AdminCategories() {
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
  return (
    <div className="space-y-6">
      <PageHeader title="Categories" description="Categories power the navigation, category pages (e.g. /women) and homepage cards." />
      {categories.map((c) => (
        <Card key={c.id}>
          <details>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <span><span className="font-medium">{c.name}</span> <span className="text-sm text-muted">/{c.slug} · {c._count.products} products{c.isFeatured ? " · on homepage" : ""}{c.isActive ? "" : " · hidden"}</span></span>
              <span className="text-sm text-bronze-deep">Edit</span>
            </summary>
            <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
              <ActionForm action={saveCategory}><CategoryFields c={c} /></ActionForm>
              <ActionForm action={deleteCategory} submitLabel="Delete" variant="ghost" confirm={`Delete “${c.name}”? Its products will become uncategorised.`}><input type="hidden" name="id" value={c.id} /></ActionForm>
            </div>
          </details>
        </Card>
      ))}
      <Card title="New category">
        <ActionForm action={saveCategory} submitLabel="Create category" resetOnSuccess><CategoryFields c={{}} /></ActionForm>
      </Card>
    </div>
  );
}
