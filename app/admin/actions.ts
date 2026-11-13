"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { parseEuroToCents } from "@/lib/money";
import { fieldErrors, slugify } from "@/lib/validation";
import { getStripe, isStripeConfigured } from "@/lib/payments/stripe";
import { OrderError, releaseOrder } from "@/lib/orders";
import { sendEmail } from "@/lib/email";
import { emails } from "@/lib/email/templates";
import type { ActionState } from "@/components/admin/ui";
import type { OrderStatus } from "@/lib/generated/prisma/client";

const ok = (message: string): ActionState => ({ status: "success", message });
const fail = (message: string, errors?: Record<string, string>): ActionState => ({ status: "error", message, errors });
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const optional = (fd: FormData, k: string) => str(fd, k) || null;
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";
const int = (fd: FormData, k: string, fallback = 0) => {
  const n = Number.parseInt(str(fd, k), 10);
  return Number.isFinite(n) ? n : fallback;
};
const date = (fd: FormData, k: string) => (str(fd, k) ? new Date(str(fd, k)) : null);

function revalidateStore() {
  revalidatePath("/", "layout");
}

function isUniqueViolation(e: unknown) {
  return (e as { code?: string })?.code === "P2002";
}

// ───────────────────────────── Products ─────────────────────────────

const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(1, "SKU is required").max(64),
  size: z.string().trim().max(30).nullable(),
  color: z.string().trim().max(40).nullable(),
  colorHex: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/).nullable().or(z.literal("")).transform((v) => v || null),
  price: z.number().int().min(0).nullable(),
  stock: z.number().int().min(0).max(1_000_000),
  isActive: z.boolean(),
});

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Name is required").max(140),
  slug: z.string().trim().max(90).optional(),
  description: z.string().trim().min(10, "Please write a description (min. 10 characters).").max(5000),
  details: z.string().trim().max(3000).nullable(),
  careInfo: z.string().trim().max(1000).nullable(),
  price: z.number().int().min(0, "Price is required"),
  compareAtPrice: z.number().int().min(0).nullable(),
  vatRate: z.number().int().min(0).max(30),
  categoryId: z.string().nullable(),
  collectionIds: z.array(z.string()),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  isFeatured: z.boolean(),
  isBestSeller: z.boolean(),
  badge: z.string().trim().max(24).nullable(),
  images: z.array(z.object({ url: z.string().trim().min(1).max(500), alt: z.string().trim().max(200) })).max(12),
  variants: z.array(variantSchema).min(1, "Add at least one variant"),
});

export type ProductInput = z.input<typeof productSchema>;

export async function saveProduct(input: ProductInput): Promise<ActionState & { id?: string }> {
  const session = await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message, fieldErrors(parsed.error));
  const p = parsed.data;
  if (p.compareAtPrice !== null && p.compareAtPrice <= p.price) return fail("The original price must be higher than the sale price, or left empty.");
  const skus = p.variants.map((v) => v.sku.toUpperCase());
  if (new Set(skus).size !== skus.length) return fail("Each variant needs a unique SKU.");
  const combos = p.variants.map((v) => `${v.color ?? ""}|${v.size ?? ""}`);
  if (new Set(combos).size !== combos.length) return fail("Two variants have the same colour and size.");
  const slug = slugify(p.slug || p.name);
  if (!slug) return fail("Please provide a valid URL slug.");

  try {
    const id = await db.$transaction(async (tx) => {
      const data = {
        name: p.name,
        slug,
        description: p.description,
        details: p.details,
        careInfo: p.careInfo,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        vatRate: p.vatRate,
        categoryId: p.categoryId,
        status: p.status,
        isFeatured: p.isFeatured,
        isBestSeller: p.isBestSeller,
        badge: p.badge,
      };
      const product = p.id
        ? await tx.product.update({
            where: { id: p.id },
            data: { ...data, collections: { set: p.collectionIds.map((id) => ({ id })) } },
          })
        : await tx.product.create({ data: { ...data, collections: { connect: p.collectionIds.map((id) => ({ id })) } } });

      if (p.status === "ACTIVE" && !product.publishedAt) {
        await tx.product.update({ where: { id: product.id }, data: { publishedAt: new Date() } });
      }

      await tx.productImage.deleteMany({ where: { productId: product.id } });
      if (p.images.length) {
        await tx.productImage.createMany({ data: p.images.map((img, i) => ({ productId: product.id, url: img.url, alt: img.alt || p.name, sortOrder: i })) });
      }

      const existing = await tx.productVariant.findMany({ where: { productId: product.id } });
      const keep = new Set(p.variants.map((v) => v.id).filter(Boolean));
      for (const old of existing) {
        if (keep.has(old.id)) continue;
        const used = await tx.orderItem.count({ where: { variantId: old.id } });
        if (used) await tx.productVariant.update({ where: { id: old.id }, data: { isActive: false } });
        else await tx.productVariant.delete({ where: { id: old.id } });
      }
      for (const [i, v] of p.variants.entries()) {
        const fields = { sku: v.sku.toUpperCase(), size: v.size || null, color: v.color || null, colorHex: v.colorHex, price: v.price, isActive: v.isActive, sortOrder: i };
        const prev = v.id ? existing.find((e) => e.id === v.id) : undefined;
        if (prev) {
          const delta = v.stock - prev.stock;
          await tx.productVariant.update({ where: { id: prev.id }, data: { ...fields, ...(delta ? { stock: { increment: delta } } : {}) } });
          if (delta) await tx.inventoryMovement.create({ data: { variantId: prev.id, delta, reason: "ADMIN_ADJUSTMENT", createdBy: session.user.id } });
        } else {
          const created = await tx.productVariant.create({ data: { ...fields, productId: product.id, stock: v.stock } });
          if (v.stock) await tx.inventoryMovement.create({ data: { variantId: created.id, delta: v.stock, reason: "INITIAL", createdBy: session.user.id } });
        }
      }
      return product.id;
    });
    revalidateStore();
    return { ...ok("Product saved."), id };
  } catch (e) {
    if (isUniqueViolation(e)) return fail("That URL slug or SKU is already in use.");
    console.error("[admin] saveProduct", e);
    return fail("Could not save the product.");
  }
}

export async function deleteProduct(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(fd, "id");
  const ordered = await db.orderItem.count({ where: { productId: id } });
  if (ordered) {
    await db.product.update({ where: { id }, data: { status: "ARCHIVED" } });
    revalidateStore();
    return ok("This product appears in orders, so it was archived instead of deleted.");
  }
  await db.product.delete({ where: { id } });
  revalidateStore();
  redirect("/admin/products");
}

// ───────────────────────────── Categories & collections ─────────────────────────────

export async function saveCategory(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = str(fd, "name");
  if (!name) return fail("Name is required.", { name: "Required" });
  const slug = slugify(str(fd, "slug") || name);
  const reserved = ["shop", "sale", "new-arrivals", "collections", "product", "cart", "checkout", "account", "wishlist", "search", "admin", "api", "about", "contact", "faq", "track-order", "impressum", "datenschutz", "agb", "widerrufsbelehrung", "versand", "rueckgabe", "cookie-richtlinie", "newsletter"];
  if (reserved.includes(slug)) return fail(`"${slug}" is reserved for another page. Please choose a different slug.`);
  const data = { name, slug, description: optional(fd, "description"), image: optional(fd, "image"), sortOrder: int(fd, "sortOrder"), isActive: bool(fd, "isActive"), isFeatured: bool(fd, "isFeatured") };
  try {
    const id = str(fd, "id");
    if (id) await db.category.update({ where: { id }, data });
    else await db.category.create({ data });
  } catch (e) {
    if (isUniqueViolation(e)) return fail("That slug is already used.");
    throw e;
  }
  revalidateStore();
  return ok("Category saved.");
}

export async function deleteCategory(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  await db.category.delete({ where: { id: str(fd, "id") } });
  revalidateStore();
  return ok("Category deleted. Its products are now uncategorised.");
}

export async function saveCollection(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = str(fd, "name");
  if (!name) return fail("Name is required.");
  const data = { name, slug: slugify(str(fd, "slug") || name), description: optional(fd, "description"), image: optional(fd, "image"), sortOrder: int(fd, "sortOrder"), isActive: bool(fd, "isActive"), isFeatured: bool(fd, "isFeatured") };
  try {
    const id = str(fd, "id");
    if (id) await db.collection.update({ where: { id }, data });
    else await db.collection.create({ data });
  } catch (e) {
    if (isUniqueViolation(e)) return fail("That slug is already used.");
    throw e;
  }
  revalidateStore();
  return ok("Collection saved.");
}

export async function deleteCollection(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  await db.collection.delete({ where: { id: str(fd, "id") } });
  revalidateStore();
  return ok("Collection deleted.");
}

// ───────────────────────────── Orders ─────────────────────────────

const FULFILMENT: OrderStatus[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export async function updateOrderStatus(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  const id = str(fd, "id");
  const status = str(fd, "status") as OrderStatus;
  const note = optional(fd, "note");
  const order = await db.order.findUnique({ where: { id } });
  if (!order) return fail("Order not found.");

  if (status === "CANCELLED") {
    if (order.paymentStatus === "PAID") return fail("This order is paid — issue a refund instead of cancelling.");
    try {
      await releaseOrder(id, { reason: note ?? "Cancelled by admin", by: session.user.id });
    } catch (e) {
      if (e instanceof OrderError) return fail(e.message);
      throw e;
    }
    const mail = emails.orderCancelled({ orderNumber: order.orderNumber, firstName: order.firstName, reason: note ?? undefined });
    await sendEmail({ to: order.email, template: "order-cancelled", orderId: id, ...mail });
    revalidatePath(`/admin/orders/${id}`);
    return ok("Order cancelled and stock released.");
  }
  if (!FULFILMENT.includes(status)) return fail("Invalid status.");
  if (order.paymentStatus !== "PAID") return fail("Only paid orders can move through fulfilment.");

  const tracking = {
    trackingCarrier: optional(fd, "trackingCarrier") ?? order.trackingCarrier,
    trackingNumber: optional(fd, "trackingNumber") ?? order.trackingNumber,
    trackingUrl: optional(fd, "trackingUrl") ?? order.trackingUrl,
  };
  if (tracking.trackingUrl && !/^https:\/\//.test(tracking.trackingUrl)) return fail("Tracking URL must start with https://");

  await db.order.update({
    where: { id },
    data: { status, ...tracking, history: status !== order.status || note ? { create: { status, note, createdBy: session.user.id } } : undefined },
  });

  let message = "Order updated.";
  if (status === "SHIPPED" && order.status !== "SHIPPED") {
    const mail = emails.orderShipped({ orderNumber: order.orderNumber, firstName: order.firstName, carrier: tracking.trackingCarrier, trackingNumber: tracking.trackingNumber, trackingUrl: tracking.trackingUrl });
    const r = await sendEmail({ to: order.email, template: "order-shipped", orderId: id, ...mail });
    message = r.status === "sent" ? "Order marked as shipped — shipping email sent." : `Order marked as shipped. Shipping email NOT sent (${r.status}).`;
  }
  revalidatePath(`/admin/orders/${id}`);
  return ok(message);
}

export async function refundOrder(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  if (!isStripeConfigured()) return fail("Stripe is not configured.");
  const id = str(fd, "id");
  const amount = parseEuroToCents(str(fd, "amount"));
  const restock = bool(fd, "restock");
  const order = await db.order.findUnique({ where: { id }, include: { payments: true, items: true } });
  const payment = order?.payments.find((p) => p.providerPaymentId && (p.status === "PAID" || p.status === "PARTIALLY_REFUNDED"));
  if (!order || !payment?.providerPaymentId) return fail("No refundable Stripe payment found for this order.");
  const refundable = payment.amount - payment.refundedAmount;
  if (!amount || amount <= 0 || amount > refundable) return fail(`Enter an amount between 0,01 € and ${(refundable / 100).toFixed(2).replace(".", ",")} €.`);

  try {
    await getStripe().refunds.create(
      { payment_intent: payment.providerPaymentId, amount, reason: "requested_by_customer", metadata: { orderId: id, by: session.user.id } },
      { idempotencyKey: `refund-${id}-${payment.refundedAmount}-${amount}` },
    );
  } catch (e) {
    console.error("[admin] refund failed", e);
    return fail(`Stripe refused the refund: ${(e as Error).message}`);
  }

  await db.$transaction(async (tx) => {
    await tx.orderStatusHistory.create({ data: { orderId: id, status: order.status, note: `Refund of ${(amount / 100).toFixed(2)} € requested via Stripe${restock ? " (items restocked)" : ""}`, createdBy: session.user.id } });
    if (restock) {
      for (const item of order.items) {
        if (!item.variantId) continue;
        await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
        await tx.inventoryMovement.create({ data: { variantId: item.variantId, delta: item.quantity, reason: "REFUND_RESTOCK", orderId: id, createdBy: session.user.id } });
      }
    }
  });
  revalidatePath(`/admin/orders/${id}`);
  return ok("Refund submitted to Stripe. The order updates automatically when Stripe confirms it.");
}

export async function addOrderNote(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  const id = str(fd, "id");
  const note = str(fd, "note");
  if (!note) return fail("Write a note first.");
  const order = await db.order.findUnique({ where: { id }, select: { status: true } });
  if (!order) return fail("Order not found.");
  await db.orderStatusHistory.create({ data: { orderId: id, status: order.status, note, createdBy: session.user.id } });
  revalidatePath(`/admin/orders/${id}`);
  return ok("Note added.");
}

// ───────────────────────────── Promotions ─────────────────────────────

export async function saveCoupon(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const code = str(fd, "code").toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) return fail("Codes use 3–30 letters, numbers, - or _.");
  const type = str(fd, "type") === "FIXED" ? "FIXED" : "PERCENTAGE";
  const value = type === "FIXED" ? parseEuroToCents(str(fd, "value")) : int(fd, "value", -1);
  if (value === null || value <= 0 || (type === "PERCENTAGE" && value > 100)) return fail(type === "PERCENTAGE" ? "Percentage must be between 1 and 100." : "Enter a positive amount.");
  const data = {
    code,
    description: optional(fd, "description"),
    type: type as "FIXED" | "PERCENTAGE",
    value,
    minOrderValue: parseEuroToCents(str(fd, "minOrderValue")),
    startsAt: date(fd, "startsAt"),
    expiresAt: date(fd, "expiresAt"),
    usageLimit: str(fd, "usageLimit") ? int(fd, "usageLimit") : null,
    isActive: bool(fd, "isActive"),
  };
  try {
    const id = str(fd, "id");
    if (id) await db.coupon.update({ where: { id }, data });
    else await db.coupon.create({ data });
  } catch (e) {
    if (isUniqueViolation(e)) return fail("That code already exists.");
    throw e;
  }
  revalidatePath("/admin/promotions");
  return ok("Promotion saved.");
}

export async function deleteCoupon(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  await db.coupon.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/promotions");
  return ok("Promotion deleted.");
}

// ───────────────────────────── Reviews & messages ─────────────────────────────

export async function moderateReview(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(fd, "id");
  const op = str(fd, "op");
  if (op === "delete") await db.review.delete({ where: { id } });
  else if (op === "approve") await db.review.update({ where: { id }, data: { status: "APPROVED" } });
  else if (op === "reject") await db.review.update({ where: { id }, data: { status: "REJECTED", isFeatured: false } });
  else if (op === "feature") await db.review.update({ where: { id, status: "APPROVED" }, data: { isFeatured: true } });
  else if (op === "unfeature") await db.review.update({ where: { id }, data: { isFeatured: false } });
  revalidateStore();
  return ok("Review updated.");
}

export async function markMessageHandled(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  await db.contactMessage.update({ where: { id: str(fd, "id") }, data: { handled: str(fd, "handled") === "true" } });
  revalidatePath("/admin/messages");
  return ok("Updated.");
}

// ───────────────────────────── Homepage & settings ─────────────────────────────

export async function saveAnnouncements(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const announcements = str(fd, "announcements").split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 6);
  await db.storeSettings.update({ where: { id: "store" }, data: { announcements, announcementActive: bool(fd, "announcementActive") } });
  revalidateStore();
  return ok("Announcement bar updated.");
}

const safeHref = (v: string | null) => (v && (v.startsWith("/") || v.startsWith("https://")) ? v : null);

export async function saveHeroSlide(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const title = str(fd, "title");
  const image = str(fd, "image");
  if (!title || !image) return fail("Title and image are required.");
  const data = {
    eyebrow: optional(fd, "eyebrow"),
    title,
    subtitle: optional(fd, "subtitle"),
    image,
    imageAlt: str(fd, "imageAlt"),
    primaryLabel: optional(fd, "primaryLabel"),
    primaryHref: safeHref(optional(fd, "primaryHref")),
    secondaryLabel: optional(fd, "secondaryLabel"),
    secondaryHref: safeHref(optional(fd, "secondaryHref")),
    sortOrder: int(fd, "sortOrder"),
    isActive: bool(fd, "isActive"),
  };
  const id = str(fd, "id");
  if (id) await db.heroSlide.update({ where: { id }, data });
  else await db.heroSlide.create({ data });
  revalidateStore();
  return ok("Slide saved.");
}

export async function deleteHeroSlide(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  await db.heroSlide.delete({ where: { id: str(fd, "id") } });
  revalidateStore();
  return ok("Slide deleted.");
}

export async function saveStoreSettings(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const email = optional(fd, "contactEmail");
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return fail("Contact email is invalid.");
  const url = (k: string) => {
    const v = optional(fd, k);
    return v && /^https:\/\//.test(v) ? v : null;
  };
  await db.storeSettings.update({
    where: { id: "store" },
    data: {
      storeName: str(fd, "storeName") || "EXEPRA",
      tagline: optional(fd, "tagline"),
      contactEmail: email,
      contactPhone: optional(fd, "contactPhone"),
      defaultVatRate: Math.min(30, Math.max(0, int(fd, "defaultVatRate", 19))),
      instagramUrl: url("instagramUrl"),
      facebookUrl: url("facebookUrl"),
      tiktokUrl: url("tiktokUrl"),
      pinterestUrl: url("pinterestUrl"),
    },
  });
  revalidateStore();
  return ok("Settings saved.");
}

export async function saveShippingRate(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const code = slugify(str(fd, "code"));
  const name = str(fd, "name");
  const price = parseEuroToCents(str(fd, "price"));
  const countries = str(fd, "countries").toUpperCase().split(/[\s,]+/).filter((c) => /^[A-Z]{2}$/.test(c));
  if (!code || !name || price === null || !countries.length) return fail("Code, name, price and at least one country code are required.");
  const minDays = int(fd, "minDays", 1);
  const maxDays = int(fd, "maxDays", minDays);
  const data = { code, name, description: optional(fd, "description"), countries, price, freeOver: parseEuroToCents(str(fd, "freeOver")), minDays, maxDays: Math.max(minDays, maxDays), sortOrder: int(fd, "sortOrder"), isActive: bool(fd, "isActive") };
  try {
    const id = str(fd, "id");
    if (id) await db.shippingRate.update({ where: { id }, data });
    else await db.shippingRate.create({ data });
  } catch (e) {
    if (isUniqueViolation(e)) return fail("That code already exists.");
    throw e;
  }
  revalidateStore();
  return ok("Shipping rate saved.");
}

export async function deleteShippingRate(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  await db.shippingRate.delete({ where: { id: str(fd, "id") } });
  revalidateStore();
  return ok("Shipping rate deleted.");
}
