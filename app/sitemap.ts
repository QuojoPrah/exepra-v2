import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, collections] = await Promise.all([
    db.product.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true, images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } } } }),
    db.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    db.collection.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
  ]);
  const staticPages = ["", "/shop", "/new-arrivals", "/sale", "/collections", "/about", "/contact", "/faq", "/versand", "/rueckgabe", "/impressum", "/datenschutz", "/agb", "/widerrufsbelehrung", "/cookie-richtlinie"];
  return [
    ...staticPages.map((p) => ({ url: siteUrl(p || "/"), changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...categories.map((c) => ({ url: siteUrl(`/${c.slug}`), lastModified: c.updatedAt, changeFrequency: "daily" as const, priority: 0.8 })),
    ...collections.map((c) => ({ url: siteUrl(`/collections/${c.slug}`), lastModified: c.updatedAt, priority: 0.7 })),
    ...products.map((p) => ({ url: siteUrl(`/product/${p.slug}`), lastModified: p.updatedAt, priority: 0.7, images: p.images.map((i) => siteUrl(i.url)) })),
  ];
}
