import { ActionForm, Card, Check, F, ImageField, PageHeader, TA } from "@/components/admin/ui";
import { deleteHeroSlide, saveAnnouncements, saveHeroSlide } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/settings";
import Link from "next/link";

export const metadata = { title: "Homepage" };

type S = { id?: string; eyebrow?: string | null; title?: string; subtitle?: string | null; image?: string; imageAlt?: string; primaryLabel?: string | null; primaryHref?: string | null; secondaryLabel?: string | null; secondaryHref?: string | null; sortOrder?: number; isActive?: boolean };

function SlideFields({ s }: { s: S }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {s.id && <input type="hidden" name="id" value={s.id} />}
      <div className="sm:col-span-2"><ImageField name="image" label="Image (landscape, min. 2000px wide)" defaultValue={s.image} folder="hero" /></div>
      <F label="Image description (alt text)" name="imageAlt" defaultValue={s.imageAlt} className="sm:col-span-2" />
      <F label="Eyebrow" name="eyebrow" defaultValue={s.eyebrow} />
      <F label="Title" name="title" defaultValue={s.title} required />
      <TA label="Subtitle" name="subtitle" defaultValue={s.subtitle} rows={2} className="sm:col-span-2" />
      <F label="Primary button label" name="primaryLabel" defaultValue={s.primaryLabel} />
      <F label="Primary button link" name="primaryHref" defaultValue={s.primaryHref} placeholder="/women" />
      <F label="Secondary button label" name="secondaryLabel" defaultValue={s.secondaryLabel} />
      <F label="Secondary button link" name="secondaryHref" defaultValue={s.secondaryHref} placeholder="/kids" />
      <F label="Order" name="sortOrder" type="number" defaultValue={s.sortOrder ?? 0} />
      <div className="pt-6"><Check label="Active" name="isActive" defaultChecked={s.isActive ?? true} /></div>
    </div>
  );
}

export default async function AdminHomepage() {
  const [settings, slides] = await Promise.all([getStoreSettings(), db.heroSlide.findMany({ orderBy: { sortOrder: "asc" } })]);
  return (
    <div className="space-y-6">
      <PageHeader title="Homepage" description="Manage the announcement bar and hero slideshow." />
      <Card title="Announcement bar">
        <ActionForm action={saveAnnouncements}>
          <TA label="Messages (one per line, rotates every 5 s)" name="announcements" defaultValue={settings.announcements.join("\n")} rows={4} />
          <Check label="Show announcement bar" name="announcementActive" defaultChecked={settings.announcementActive} />
        </ActionForm>
      </Card>
      <h2 className="pt-4 text-lg font-semibold">Hero slides</h2>
      {slides.map((s) => (
        <Card key={s.id}>
          <details>
            <summary className="flex cursor-pointer list-none items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt="" className="h-14 w-24 rounded-lg object-cover" />
              <span className="flex-1"><span className="font-medium">{s.title}</span><span className="block text-xs text-muted">#{s.sortOrder}{s.isActive ? "" : " · hidden"}</span></span>
              <span className="text-sm text-bronze-deep">Edit</span>
            </summary>
            <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
              <ActionForm action={saveHeroSlide}><SlideFields s={s} /></ActionForm>
              <ActionForm action={deleteHeroSlide} submitLabel="Delete" variant="ghost" confirm="Delete this slide?"><input type="hidden" name="id" value={s.id} /></ActionForm>
            </div>
          </details>
        </Card>
      ))}
      <Card title="New slide"><ActionForm action={saveHeroSlide} submitLabel="Add slide" resetOnSuccess><SlideFields s={{}} /></ActionForm></Card>
      <Card title="Other homepage sections">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
          <li>Featured categories: tick “Feature on homepage” in <Link href="/admin/categories" className="underline">Categories</Link>.</li>
          <li>Best sellers: tick “Show in homepage Best Sellers” on a product (falls back to top-selling products).</li>
          <li>Featured collections: tick “Show in homepage slider” in <Link href="/admin/collections" className="underline">Collections</Link>.</li>
          <li>Customer reviews: feature approved reviews in <Link href="/admin/reviews?status=APPROVED" className="underline">Reviews</Link>.</li>
        </ul>
      </Card>
    </div>
  );
}
