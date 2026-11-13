import "server-only";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { cardInclude, ratingsFor, toSummary } from "@/lib/catalog";

export const WISHLIST_COOKIE = "exepra_wishlist";

async function mergeGuest(token: string, userId: string) {
  const guest = await db.wishlist.findUnique({ where: { token }, include: { items: true } });
  if (!guest || guest.userId) return;
  const mine = await db.wishlist.upsert({ where: { userId }, create: { userId }, update: {} });
  await db.$transaction([
    db.wishlistItem.createMany({
      data: guest.items.map((i) => ({ wishlistId: mine.id, productId: i.productId })),
      skipDuplicates: true,
    }),
    db.wishlist.delete({ where: { id: guest.id } }),
  ]);
}

export async function resolveWishlist(opts: { create?: boolean } = {}) {
  const session = await getSession();
  const jar = await cookies();
  const token = jar.get(WISHLIST_COOKIE)?.value;
  if (session) {
    if (token) {
      await mergeGuest(token, session.user.id);
      if (opts.create) jar.delete(WISHLIST_COOKIE);
    }
    const existing = await db.wishlist.findUnique({ where: { userId: session.user.id } });
    if (existing || !opts.create) return existing;
    return db.wishlist.create({ data: { userId: session.user.id } });
  }
  if (token) {
    const existing = await db.wishlist.findUnique({ where: { token } });
    if (existing) return existing;
  }
  if (!opts.create) return null;
  const newToken = randomBytes(24).toString("base64url");
  const wl = await db.wishlist.create({ data: { token: newToken } });
  jar.set(WISHLIST_COOKIE, newToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return wl;
}

export async function getWishlistIds(): Promise<string[]> {
  const wl = await resolveWishlist();
  if (!wl) return [];
  const items = await db.wishlistItem.findMany({ where: { wishlistId: wl.id }, select: { productId: true } });
  return items.map((i) => i.productId);
}

export async function getWishlistProducts() {
  const wl = await resolveWishlist();
  if (!wl) return [];
  const items = await db.wishlistItem.findMany({
    where: { wishlistId: wl.id },
    orderBy: { createdAt: "desc" },
    include: { product: { include: cardInclude } },
  });
  const ratings = await ratingsFor(items.map((i) => i.productId));
  return items.map((i) => ({
    ...toSummary(i.product, ratings.get(i.productId)),
    available: i.product.status === "ACTIVE",
    singleVariantId:
      i.product.variants.length === 1 && i.product.variants[0].stock > 0 ? i.product.variants[0].id : null,
  }));
}

export async function toggleWishlist(productId: string, desired?: boolean) {
  const product = await db.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) throw new Error("Product not found");
  const wl = (await resolveWishlist({ create: true }))!;
  const existing = await db.wishlistItem.findUnique({ where: { wishlistId_productId: { wishlistId: wl.id, productId } } });
  const shouldAdd = desired ?? !existing;
  if (shouldAdd && !existing) await db.wishlistItem.create({ data: { wishlistId: wl.id, productId } });
  if (!shouldAdd && existing) await db.wishlistItem.delete({ where: { id: existing.id } });
  const items = await db.wishlistItem.findMany({ where: { wishlistId: wl.id }, select: { productId: true } });
  return items.map((i) => i.productId);
}
