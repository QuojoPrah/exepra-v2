import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/catalog";

export async function GET(_: Request, ctx: RouteContext<"/api/products/[slug]">) {
  const { slug } = await ctx.params;
  const p = await getProductBySlug(slug);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    category: p.category?.name ?? null,
    images: p.images.map((i) => ({ url: i.url, alt: i.alt || p.name })),
    variants: p.variants.map((v) => ({ id: v.id, size: v.size, color: v.color, colorHex: v.colorHex, price: v.price, stock: v.stock })),
    rating: p.rating,
  });
}
