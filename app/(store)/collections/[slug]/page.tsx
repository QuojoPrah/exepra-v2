import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/product/product-listing";
import { db } from "@/lib/db";

async function getCollection(slug: string) {
  return db.collection.findFirst({ where: { slug, isActive: true } });
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const c = await getCollection((await params).slug);
  if (!c) return {};
  return { title: c.name, description: c.description ?? undefined, alternates: { canonical: `/collections/${c.slug}` } };
}

export default async function CollectionPage({ params, searchParams }: PageProps<"/collections/[slug]">) {
  const c = await getCollection((await params).slug);
  if (!c) notFound();
  return (
    <ProductListing
      title={c.name}
      description={c.description}
      banner={c.image}
      crumbs={[{ label: "Collections", href: "/collections" }, { label: c.name }]}
      base={{ collection: c.slug }}
      basePath={`/collections/${c.slug}`}
      searchParams={await searchParams}
    />
  );
}
