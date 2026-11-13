import { ActionForm, Card, Check, F, ImageField, PageHeader, TA } from "@/components/admin/ui";
import { deleteCollection, saveCollection } from "@/app/admin/actions";
import { db } from "@/lib/db";

export const metadata = { title: "Collections" };

type Col = { id?: string; name?: string; slug?: string; description?: string | null; image?: string | null; sortOrder?: number; isActive?: boolean; isFeatured?: boolean };

function CollectionFields({ c }: { c: Col }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {c.id && <input type="hidden" name="id" value={c.id} />}
      <F label="Name" name="name" defaultValue={c.name} required />
      <F label="URL slug" name="slug" defaultValue={c.slug} hint="Becomes /collections/slug" />
      <TA label="Description" name="description" defaultValue={c.description} rows={2} className="sm:col-span-2" />
      <div className="sm:col-span-2"><ImageField name="image" label="Banner / card image" defaultValue={c.image} folder="collections" /></div>
      <F label="Sort order" name="sortOrder" type="number" defaultValue={c.sortOrder ?? 0} />
      <div className="space-y-2 pt-6"><Check label="Active (visible in store)" name="isActive" defaultChecked={c.isActive ?? true} /><Check label="Show in homepage slider" name="isFeatured" defaultChecked={c.isFeatured} /></div>
    </div>
  );
}

export default async function AdminCollections() {
  const collections = await db.collection.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
  return (
    <div className="space-y-6">
      <PageHeader title="Collections" description="Curated edits shown at /collections. Featured collections appear in the homepage slider. Assign products from the product editor." />
      {collections.map((c) => (
        <Card key={c.id}>
          <details>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <span><span className="font-medium">{c.name}</span> <span className="text-sm text-muted">/{c.slug} · {c._count.products} products{c.isFeatured ? " · in homepage slider" : ""}{c.isActive ? "" : " · hidden"}</span></span>
              <span className="text-sm text-bronze-deep">Edit</span>
            </summary>
            <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
              <ActionForm action={saveCollection}><CollectionFields c={c} /></ActionForm>
              <ActionForm action={deleteCollection} submitLabel="Delete" variant="ghost" confirm={`Delete “${c.name}”? Products stay in the store.`}><input type="hidden" name="id" value={c.id} /></ActionForm>
            </div>
          </details>
        </Card>
      ))}
      <Card title="New collection">
        <ActionForm action={saveCollection} submitLabel="Create collection" resetOnSuccess><CollectionFields c={{}} /></ActionForm>
      </Card>
    </div>
  );
}
