import "server-only";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getShippingRules, getStoreSettings } from "@/lib/settings";
import { computeTotals, type ShippingOption } from "@/lib/pricing";

export const CART_COOKIE = "exepra_cart";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 60; // 60 days

export class CartError extends Error {}

const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" as const },
    include: {
      variant: {
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              price: true,
              compareAtPrice: true,
              vatRate: true,
              status: true,
              images: { orderBy: { sortOrder: "asc" as const }, take: 1, select: { url: true, alt: true } },
            },
          },
        },
      },
    },
  },
};

export function variantLabel(v: { color: string | null; size: string | null }) {
  return [v.color, v.size].filter(Boolean).join(" / ") || null;
}

async function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

/** Merge a guest cart into a user's cart (sum quantities, cap at stock). */
async function mergeGuestCart(guestToken: string, userId: string) {
  const guest = await db.cart.findUnique({ where: { token: guestToken }, include: { items: { include: { variant: true } } } });
  if (!guest) return;
  if (guest.userId === userId) return;
  const userCart = await db.cart.upsert({ where: { userId }, create: { userId }, update: {} });
  await db.$transaction(async (tx) => {
    for (const item of guest.items) {
      const existing = await tx.cartItem.findUnique({ where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } } });
      const quantity = Math.min((existing?.quantity ?? 0) + item.quantity, Math.max(item.variant.stock, 0), 99);
      if (quantity <= 0) continue;
      await tx.cartItem.upsert({
        where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
        create: { cartId: userCart.id, variantId: item.variantId, quantity },
        update: { quantity },
      });
    }
    if (!userCart.couponCode && guest.couponCode) {
      await tx.cart.update({ where: { id: userCart.id }, data: { couponCode: guest.couponCode } });
    }
    await tx.cart.delete({ where: { id: guest.id } });
  });
}

/**
 * Resolve the current cart. With `create`, a cart (and guest cookie) is created when
 * missing — only call with create from a Route Handler or Server Action.
 */
export async function resolveCart(opts: { create?: boolean } = {}) {
  const session = await getSession();
  const jar = await cookies();
  const token = jar.get(CART_COOKIE)?.value;

  if (session) {
    if (token) {
      await mergeGuestCart(token, session.user.id);
      if (opts.create) jar.delete(CART_COOKIE);
    }
    const existing = await db.cart.findUnique({ where: { userId: session.user.id } });
    if (existing || !opts.create) return existing;
    return db.cart.create({ data: { userId: session.user.id } });
  }

  if (token) {
    const existing = await db.cart.findUnique({ where: { token } });
    if (existing && !existing.userId) return existing;
  }
  if (!opts.create) return null;
  const newToken = randomBytes(24).toString("base64url");
  const cart = await db.cart.create({ data: { token: newToken } });
  jar.set(CART_COOKIE, newToken, await cookieOptions());
  return cart;
}

export type CartLine = {
  id: string;
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  variantLabel: string | null;
  sku: string;
  image: string | null;
  imageAlt: string;
  unitPrice: number;
  compareAtPrice: number | null;
  quantity: number;
  stock: number;
  lineTotal: number;
  vatRate: number;
  issue: null | "unavailable" | "out_of_stock" | "reduced";
};

export type CartView = {
  id: string | null;
  lines: CartLine[];
  count: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode: string | null;
  couponError: string | null;
  shippingOption: ShippingOption | null;
  hasIssues: boolean;
};

const EMPTY: CartView = {
  id: null,
  lines: [],
  count: 0,
  subtotal: 0,
  discount: 0,
  shipping: 0,
  tax: 0,
  total: 0,
  couponCode: null,
  couponError: null,
  shippingOption: null,
  hasIssues: false,
};

/** Build the priced cart from the database. Quantities above stock are clamped and flagged. */
export async function buildCartView(cartId: string | null | undefined, opts: { country?: string; shippingCode?: string | null } = {}): Promise<CartView> {
  if (!cartId) return EMPTY;
  const cart = await db.cart.findUnique({ where: { id: cartId }, include: cartInclude });
  if (!cart) return EMPTY;

  const lines: CartLine[] = cart.items.map((item) => {
    const v = item.variant;
    const p = v.product;
    const unitPrice = v.price ?? p.price;
    let issue: CartLine["issue"] = null;
    let quantity = item.quantity;
    if (!v.isActive || p.status !== "ACTIVE") issue = "unavailable";
    else if (v.stock <= 0) issue = "out_of_stock";
    else if (quantity > v.stock) {
      issue = "reduced";
      quantity = v.stock;
    }
    return {
      id: item.id,
      variantId: v.id,
      productId: p.id,
      slug: p.slug,
      name: p.name,
      variantLabel: variantLabel(v),
      sku: v.sku,
      image: p.images[0]?.url ?? null,
      imageAlt: p.images[0]?.alt || p.name,
      unitPrice,
      compareAtPrice: p.compareAtPrice,
      quantity,
      stock: v.stock,
      lineTotal: unitPrice * quantity,
      vatRate: p.vatRate,
      issue,
    };
  });

  const purchasable = lines.filter((l) => l.issue === null || l.issue === "reduced");
  const [rules, settings, coupon] = await Promise.all([
    getShippingRules(),
    getStoreSettings(),
    cart.couponCode ? db.coupon.findUnique({ where: { code: cart.couponCode } }) : null,
  ]);

  const totals = computeTotals({
    lines: purchasable.map((l) => ({ unitPrice: l.unitPrice, quantity: l.quantity, vatRate: l.vatRate })),
    coupon,
    couponCode: cart.couponCode,
    shippingRules: rules,
    country: opts.country ?? "DE",
    shippingCode: opts.shippingCode,
    defaultVatRate: settings.defaultVatRate,
  });

  return {
    id: cart.id,
    lines,
    count: purchasable.reduce((n, l) => n + l.quantity, 0),
    ...totals,
    hasIssues: lines.some((l) => l.issue !== null),
  };
}

export async function getCartView(opts?: { country?: string; shippingCode?: string | null }) {
  const cart = await resolveCart();
  return buildCartView(cart?.id, opts);
}

async function loadVariant(variantId: string) {
  const variant = await db.productVariant.findUnique({
    where: { id: variantId },
    include: { product: { select: { status: true, name: true } } },
  });
  if (!variant || !variant.isActive || variant.product.status !== "ACTIVE") {
    throw new CartError("This product is no longer available.");
  }
  return variant;
}

export async function addToCart(variantId: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new CartError("Invalid quantity.");
  const variant = await loadVariant(variantId);
  const cart = (await resolveCart({ create: true }))!;
  const existing = await db.cartItem.findUnique({ where: { cartId_variantId: { cartId: cart.id, variantId } } });
  const desired = (existing?.quantity ?? 0) + quantity;
  if (variant.stock <= 0) throw new CartError("Sorry, this item is out of stock.");
  if (desired > variant.stock) {
    throw new CartError(
      variant.stock - (existing?.quantity ?? 0) > 0
        ? `Only ${variant.stock} available — you can add ${variant.stock - (existing?.quantity ?? 0)} more.`
        : `You already have all ${variant.stock} available in your bag.`,
    );
  }
  await db.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    create: { cartId: cart.id, variantId, quantity: desired },
    update: { quantity: desired },
  });
  await db.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });
  return buildCartView(cart.id);
}

export async function setCartQuantity(variantId: string, quantity: number) {
  const cart = await resolveCart({ create: true });
  if (!cart) return EMPTY;
  if (quantity <= 0) {
    await db.cartItem.deleteMany({ where: { cartId: cart.id, variantId } });
    return buildCartView(cart.id);
  }
  const variant = await loadVariant(variantId);
  if (quantity > variant.stock) throw new CartError(`Only ${variant.stock} available.`);
  await db.cartItem.update({ where: { cartId_variantId: { cartId: cart.id, variantId } }, data: { quantity } });
  return buildCartView(cart.id);
}

export async function applyCoupon(code: string | null) {
  const cart = await resolveCart({ create: true });
  if (!cart) return EMPTY;
  const normalized = code?.trim().toUpperCase() || null;
  if (normalized) {
    const view = await buildCartView(cart.id);
    const coupon = await db.coupon.findUnique({ where: { code: normalized } });
    const { evaluateCoupon } = await import("@/lib/pricing");
    const check = evaluateCoupon(coupon, view.subtotal);
    if (!check.valid) throw new CartError(check.reason);
  }
  await db.cart.update({ where: { id: cart.id }, data: { couponCode: normalized } });
  return buildCartView(cart.id);
}
