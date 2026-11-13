import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

export const PAGE_SIZE = 12;

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const cardInclude = {
  images: { orderBy: { sortOrder: "asc" }, take: 2 },
  category: { select: { name: true, slug: true } },
  variants: { where: { isActive: true }, select: { id: true, stock: true, size: true, color: true, colorHex: true, price: true } },
} satisfies Prisma.ProductInclude;

export type CardProduct = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

/** Serializable product summary used by product cards (server → client). */
export type ProductSummary = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  price: number;
  compareAtPrice: number | null;
  badge: string | null;
  image: string | null;
  imageAlt: string;
  hoverImage: string | null;
  inStock: boolean;
  /** Set when the product has exactly one purchasable variant (enables one-click add). */
  quickAddVariantId: string | null;
  isDemo: boolean;
  colors: { name: string; hex: string | null }[];
  rating: { average: number; count: number } | null;
};

export function toSummary(p: CardProduct, rating?: { average: number; count: number } | null): ProductSummary {
  const prices = p.variants.map((v) => v.price ?? p.price);
  const colors = new Map<string, string | null>();
  p.variants.forEach((v) => v.color && colors.set(v.color, v.colorHex));
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category?.name ?? null,
    price: prices.length ? Math.min(...prices) : p.price,
    compareAtPrice: p.compareAtPrice,
    badge: p.badge,
    image: p.images[0]?.url ?? null,
    imageAlt: p.images[0]?.alt || p.name,
    hoverImage: p.images[1]?.url ?? null,
    inStock: p.variants.some((v) => v.stock > 0),
    quickAddVariantId: p.variants.length === 1 && p.variants[0].stock > 0 ? p.variants[0].id : null,
    isDemo: p.isDemo,
    colors: [...colors].map(([name, hex]) => ({ name, hex })),
    rating: rating ?? null,
  };
}

/** Aggregate approved review ratings. Only genuine approved reviews are counted. */
export async function ratingsFor(productIds: string[]) {
  if (!productIds.length) return new Map<string, { average: number; count: number }>();
  const rows = await db.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds }, status: "APPROVED" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return new Map(rows.map((r) => [r.productId, { average: Math.round((r._avg.rating ?? 0) * 10) / 10, count: r._count._all }]));
}

async function summaries(products: CardProduct[]) {
  const ratings = await ratingsFor(products.map((p) => p.id));
  return products.map((p) => toSummary(p, ratings.get(p.id)));
}

export type ListingFilters = {
  category?: string;
  collection?: string;
  q?: string;
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  newArrivals?: boolean;
  sort?: SortValue;
  page?: number;
};

const NEW_ARRIVAL_DAYS = 45;

function listingWhere(f: ListingFilters): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [{ status: "ACTIVE" }];
  if (f.category) and.push({ category: { slug: f.category, isActive: true } });
  if (f.collection) and.push({ collections: { some: { slug: f.collection } } });
  if (f.q) {
    const terms = f.q.trim().split(/\s+/).filter(Boolean).slice(0, 6);
    for (const term of terms) {
      and.push({
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
          { details: { contains: term, mode: "insensitive" } },
          { category: { name: { contains: term, mode: "insensitive" } } },
          { variants: { some: { OR: [{ color: { contains: term, mode: "insensitive" } }, { size: { equals: term, mode: "insensitive" } }] } } },
        ],
      });
    }
  }
  const variantFilter: Prisma.ProductVariantWhereInput = { isActive: true };
  if (f.sizes?.length) variantFilter.size = { in: f.sizes };
  if (f.colors?.length) variantFilter.color = { in: f.colors };
  if (f.inStock) variantFilter.stock = { gt: 0 };
  if (f.sizes?.length || f.colors?.length || f.inStock) and.push({ variants: { some: variantFilter } });
  if (f.minPrice !== undefined) and.push({ price: { gte: f.minPrice } });
  if (f.maxPrice !== undefined) and.push({ price: { lte: f.maxPrice } });
  if (f.onSale) and.push({ compareAtPrice: { not: null } });
  if (f.newArrivals) and.push({ createdAt: { gte: new Date(Date.now() - NEW_ARRIVAL_DAYS * 864e5) } });
  return { AND: and };
}

function listingOrder(sort: SortValue = "featured"): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }];
    case "price-asc":
      return [{ price: "asc" }];
    case "price-desc":
      return [{ price: "desc" }];
    case "best-selling":
      return [{ salesCount: "desc" }, { createdAt: "desc" }];
    default:
      return [{ isFeatured: "desc" }, { isBestSeller: "desc" }, { createdAt: "desc" }];
  }
}

export async function getProductListing(f: ListingFilters) {
  const where = listingWhere(f);
  const page = Math.max(1, f.page ?? 1);
  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: cardInclude,
      orderBy: listingOrder(f.sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  return { total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)), products: await summaries(products) };
}

/** Facet values available within the current base scope (category / collection / sale / new). */
export async function getFacets(base: Pick<ListingFilters, "category" | "collection" | "onSale" | "newArrivals" | "q">) {
  const where = listingWhere(base);
  const [variants, priceRange] = await Promise.all([
    db.productVariant.findMany({
      where: { isActive: true, product: where },
      select: { size: true, color: true, colorHex: true },
    }),
    db.product.aggregate({ where, _min: { price: true }, _max: { price: true } }),
  ]);
  const sizeOrder = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "One Size"];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean) as string[])].sort((a, b) => {
    const ia = sizeOrder.indexOf(a);
    const ib = sizeOrder.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.localeCompare(b, "de", { numeric: true });
  });
  const colors = new Map<string, string | null>();
  variants.forEach((v) => v.color && colors.set(v.color, v.colorHex));
  return {
    sizes,
    colors: [...colors].map(([name, hex]) => ({ name, hex })),
    minPrice: priceRange._min.price ?? 0,
    maxPrice: priceRange._max.price ?? 0,
  };
}

export const getProductBySlug = cache(async (slug: string) => {
  const product = await db.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, rating: true, title: true, body: true, displayName: true, isVerifiedPurchase: true, createdAt: true },
      },
    },
  });
  if (!product) return null;
  const rating = (await ratingsFor([product.id])).get(product.id) ?? null;
  return { ...product, rating };
});

export async function getRelatedProducts(productId: string, categoryId: string | null, take = 4) {
  const products = await db.product.findMany({
    where: { status: "ACTIVE", id: { not: productId }, ...(categoryId ? { categoryId } : {}) },
    include: cardInclude,
    orderBy: [{ salesCount: "desc" }, { createdAt: "desc" }],
    take,
  });
  return summaries(products);
}

export async function getBestSellers(take = 8) {
  const products = await db.product.findMany({
    where: { status: "ACTIVE" },
    include: cardInclude,
    orderBy: [{ isBestSeller: "desc" }, { salesCount: "desc" }, { createdAt: "desc" }],
    take,
  });
  return summaries(products);
}

export async function searchProducts(q: string, take = 6) {
  if (!q.trim()) return [];
  const products = await db.product.findMany({
    where: listingWhere({ q }),
    include: cardInclude,
    orderBy: [{ salesCount: "desc" }],
    take,
  });
  return summaries(products);
}

export const getNavCategories = cache(async () =>
  db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true, description: true, image: true },
  }),
);

export const getCategory = cache(async (slug: string) =>
  db.category.findFirst({ where: { slug, isActive: true } }),
);

export async function getFeaturedCategories() {
  return db.category.findMany({ where: { isActive: true, isFeatured: true }, orderBy: { sortOrder: "asc" } });
}

export async function getFeaturedCollections() {
  const collections = await db.collection.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { sortOrder: "asc" },
    include: { products: { where: { status: "ACTIVE" }, include: cardInclude, take: 4 } },
  });
  return Promise.all(
    collections.map(async (c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      image: c.image,
      products: await summaries(c.products),
    })),
  );
}

export async function getActiveCollections() {
  return db.collection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { status: "ACTIVE" } } } } },
  });
}

export async function getFeaturedReviews(take = 6) {
  return db.review.findMany({
    where: { status: "APPROVED", isFeatured: true },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      rating: true,
      title: true,
      body: true,
      displayName: true,
      isVerifiedPurchase: true,
      product: { select: { name: true, slug: true } },
    },
  });
}

export async function getHeroSlides() {
  return db.heroSlide.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
}
