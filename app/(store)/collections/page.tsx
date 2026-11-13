import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getActiveCollections } from "@/lib/catalog";
import { FALLBACK_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated EXEPRA edits for every moment.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const collections = await getActiveCollections();
  return (
    <div className="container-page py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "Collections" }]} />
      <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Collections</h1>
      <p className="mt-3 max-w-xl text-muted">Curated edits that bring our favourite pieces together.</p>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {collections.map((c) => (
          <li key={c.id}>
            <Link href={`/collections/${c.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-cream">
                <Image src={c.image ?? FALLBACK_IMAGE} alt="" fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover transition duration-[1200ms] group-hover:scale-[1.03]" />
              </div>
              <h2 className="mt-4 text-xl font-semibold group-hover:text-bronze-deep">{c.name}</h2>
              {c.description && <p className="mt-1 text-sm text-muted">{c.description}</p>}
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted">{c._count.products} pieces</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
