import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/product/product-listing";
import { getCategory } from "@/lib/catalog";

export async function generateMetadata({ params }: PageProps<"/[category]">): Promise<Metadata> {
  const { category } = await params;
  const c = await getCategory(category);
  if (!c) return {};
  return {
    title: c.name,
    description: c.description ?? `Shop ${c.name} at EXEPRA.`,
    alternates: { canonical: `/${c.slug}` },
    openGraph: c.image ? { images: [c.image] } : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[category]">) {
  const { category } = await params;
  const c = await getCategory(category);
  if (!c) notFound();
  return (
    <ProductListing
      title={c.name}
      description={c.description}
      banner={c.image}
      crumbs={[{ label: "Shop", href: "/shop" }, { label: c.name }]}
      base={{ category: c.slug }}
      basePath={`/${c.slug}`}
      searchParams={await searchParams}
      emptyMessage={`We're preparing our ${c.name} edit. New pieces are coming soon — in the meantime, explore the rest of the shop.`}
    />
  );
}
