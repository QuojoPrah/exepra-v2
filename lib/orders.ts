import "server-only";
import { randomInt } from "node:crypto";
import { db } from "@/lib/db";
import { buildCartView, variantLabel } from "@/lib/cart";
import type { CheckoutInput } from "@/lib/validation";
import { sendEmail } from "@/lib/email";
import { emails, type OrderEmailData } from "@/lib/email/templates";
import type { OrderStatus, Prisma } from "@/lib/generated/prisma/client";

export class OrderError extends Error {}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateOrderNumber(date = new Date()) {
  const ymd = date.toISOString().slice(2, 10).replace(/-/g, "");
  let suffix = "";
  for (let i = 0; i < 5; i++) suffix += ALPHABET[randomInt(ALPHABET.length)];
  return `EX${ymd}-${suffix}`;
}

export type AddressSnapshot = {
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  houseNumber: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  country: string;
  phone?: string;
  vatId?: string;
};

function snapshot(a: CheckoutInput["shipping"], extra: Partial<AddressSnapshot> = {}): AddressSnapshot {
  return {
    firstName: a.firstName,
    lastName: a.lastName,
    company: a.company || undefined,
    street: a.street,
    houseNumber: a.houseNumber,
    addressLine2: a.addressLine2 || undefined,
    postalCode: a.postalCode.trim().toUpperCase(),
    city: a.city,
    country: a.country,
    phone: a.phone || undefined,
    ...extra,
  };
}

/**
 * Creates a PENDING order from the current cart and atomically reserves stock.
 * Totals are recomputed from the database — nothing from the client is trusted.
 */
export async function createPendingOrder(input: CheckoutInput, ctx: { cartId: string; userId: string | null }) {
  const view = await buildCartView(ctx.cartId, { country: input.shipping.country, shippingCode: input.shippingMethod });
  if (view.lines.length === 0) throw new OrderError("Your bag is empty.");
  if (view.hasIssues) throw new OrderError("Some items in your bag changed availability. Please review your bag.");
  if (view.couponError) throw new OrderError(view.couponError);
  if (!view.shippingOption || view.shippingOption.code !== input.shippingMethod) {
    throw new OrderError("The selected delivery method isn't available for this address.");
  }

  const billing = input.billingSameAsShipping || !input.billing ? input.shipping : input.billing;

  for (let attempt = 0; attempt < 3; attempt++) {
    const orderNumber = generateOrderNumber();
    try {
      return await db.$transaction(async (tx) => {
        for (const line of view.lines) {
          const reserved = await tx.productVariant.updateMany({
            where: { id: line.variantId, isActive: true, stock: { gte: line.quantity } },
            data: { stock: { decrement: line.quantity } },
          });
          if (reserved.count !== 1) {
            throw new OrderError(`Sorry, "${line.name}" just sold out in the quantity you selected.`);
          }
        }

        const order = await tx.order.create({
          data: {
            orderNumber,
            userId: ctx.userId,
            cartId: ctx.cartId,
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone || null,
            shippingAddress: snapshot(input.shipping),
            billingAddress: snapshot(billing, { vatId: input.vatId || undefined }),
            subtotal: view.subtotal,
            discountTotal: view.discount,
            shippingTotal: view.shipping,
            taxTotal: view.tax,
            total: view.total,
            couponCode: view.couponCode,
            shippingMethod: view.shippingOption!.code,
            shippingLabel: view.shippingOption!.name,
            customerNote: input.customerNote || null,
            items: {
              create: view.lines.map((l) => ({
                productId: l.productId,
                variantId: l.variantId,
                productName: l.name,
                productSlug: l.slug,
                variantLabel: l.variantLabel,
                sku: l.sku,
                image: l.image,
                unitPrice: l.unitPrice,
                quantity: l.quantity,
                vatRate: l.vatRate,
                lineTotal: l.lineTotal,
              })),
            },
            history: { create: { status: "PENDING", note: "Order created, awaiting payment", createdBy: "system" } },
          },
          include: { items: true },
        });

        await tx.inventoryMovement.createMany({
          data: view.lines.map((l) => ({
            variantId: l.variantId,
            delta: -l.quantity,
            reason: "ORDER_RESERVED" as const,
            orderId: order.id,
          })),
        });
        return order;
      });
    } catch (err) {
      if (err instanceof OrderError) throw err;
      const code = (err as { code?: string }).code;
      if (code === "P2002" && attempt < 2) continue; // order number collision
      throw err;
    }
  }
  throw new OrderError("Could not create your order. Please try again.");
}

/** Returns reserved stock and cancels an unpaid order. Idempotent. */
export async function releaseOrder(orderId: string, opts: { reason: string; by: string; status?: OrderStatus }) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) return null;
    if (order.stockReleased) return order;
    if (order.paymentStatus === "PAID") throw new OrderError("Paid orders must be refunded before cancelling.");
    for (const item of order.items) {
      if (!item.variantId) continue;
      await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
      await tx.inventoryMovement.create({
        data: { variantId: item.variantId, delta: item.quantity, reason: "ORDER_RELEASED", orderId, note: opts.reason, createdBy: opts.by },
      });
    }
    const status = opts.status ?? "CANCELLED";
    return tx.order.update({
      where: { id: orderId },
      data: {
        stockReleased: true,
        status,
        paymentStatus: order.paymentStatus === "UNPAID" ? "FAILED" : order.paymentStatus,
        history: { create: { status, note: opts.reason, createdBy: opts.by } },
      },
    });
  });
}

export function toEmailData(order: Prisma.OrderGetPayload<{ include: { items: true } }>): OrderEmailData {
  return {
    orderNumber: order.orderNumber,
    firstName: order.firstName,
    items: order.items.map((i) => ({ productName: i.productName, variantLabel: i.variantLabel, quantity: i.quantity, lineTotal: i.lineTotal })),
    subtotal: order.subtotal,
    discountTotal: order.discountTotal,
    shippingTotal: order.shippingTotal,
    taxTotal: order.taxTotal,
    total: order.total,
    shippingLabel: order.shippingLabel,
    shippingAddress: order.shippingAddress as unknown as OrderEmailData["shippingAddress"],
  };
}

/**
 * Marks an order as paid. Called ONLY from verified payment webhooks.
 * Idempotent: repeated events for the same order are ignored.
 */
export async function markOrderPaid(input: {
  orderId: string;
  sessionId: string;
  paymentIntentId: string | null;
  amount: number;
  currency: string;
  method?: string | null;
}) {
  const result = await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: input.orderId }, include: { items: true } });
    if (!order) throw new Error(`Order ${input.orderId} not found`);
    if (order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED" || order.paymentStatus === "PARTIALLY_REFUNDED") {
      return { order, changed: false };
    }

    const notes: string[] = ["Payment confirmed by Stripe"];
    if (input.amount !== order.total || input.currency.toUpperCase() !== order.currency) {
      notes.push(`⚠ Amount mismatch: received ${input.amount} ${input.currency}, expected ${order.total} ${order.currency}`);
    }

    if (order.stockReleased) {
      // Stock was released (e.g. expired) before payment arrived — try to re-reserve.
      for (const item of order.items) {
        if (!item.variantId) continue;
        const r = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (r.count === 1) {
          await tx.inventoryMovement.create({ data: { variantId: item.variantId, delta: -item.quantity, reason: "ORDER_RESERVED", orderId: order.id, note: "Re-reserved after late payment" } });
        } else {
          notes.push(`⚠ Insufficient stock for ${item.sku} after late payment — manual review required`);
        }
      }
    }

    if (input.paymentIntentId) {
      await tx.payment.upsert({
        where: { providerPaymentId: input.paymentIntentId },
        create: {
          orderId: order.id,
          providerPaymentId: input.paymentIntentId,
          checkoutSessionId: input.sessionId,
          amount: input.amount,
          currency: input.currency.toUpperCase(),
          status: "PAID",
          method: input.method ?? null,
        },
        update: { status: "PAID", amount: input.amount, method: input.method ?? undefined },
      });
    } else {
      await tx.payment.create({
        data: { orderId: order.id, checkoutSessionId: input.sessionId, amount: input.amount, currency: input.currency.toUpperCase(), status: "PAID", method: input.method ?? null },
      });
    }

    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paymentStatus: "PAID",
        paidAt: new Date(),
        stockReleased: false,
        history: { create: { status: "PAID", note: notes.join(". "), createdBy: "stripe" } },
      },
      include: { items: true },
    });

    if (order.couponCode) {
      await tx.coupon.updateMany({ where: { code: order.couponCode }, data: { usageCount: { increment: 1 } } });
    }
    for (const item of order.items) {
      if (item.productId) {
        await tx.product.updateMany({ where: { id: item.productId }, data: { salesCount: { increment: item.quantity } } });
      }
    }
    if (order.cartId) {
      // Remove only the purchased variants so items added afterwards are kept.
      await tx.cartItem.deleteMany({
        where: { cartId: order.cartId, variantId: { in: order.items.map((i) => i.variantId).filter(Boolean) as string[] } },
      });
      await tx.cart.updateMany({ where: { id: order.cartId }, data: { couponCode: null } });
    }
    return { order: updated, changed: true };
  });

  if (result.changed) {
    const mail = emails.orderConfirmation(toEmailData(result.order));
    await sendEmail({ to: result.order.email, template: "order-confirmation", orderId: result.order.id, ...mail });
  }
  return result;
}

/** Records that an async payment method (e.g. SEPA) is processing. */
export async function markOrderAwaitingPayment(orderId: string, sessionId: string, paymentIntentId: string | null, amount: number) {
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true, payments: true } });
  if (!order || order.paymentStatus !== "UNPAID" || order.payments.length > 0) return;
  await db.order.update({
    where: { id: orderId },
    data: {
      payments: {
        create: { providerPaymentId: paymentIntentId, checkoutSessionId: sessionId, amount, status: "UNPAID", method: "async" },
      },
      history: { create: { status: "PENDING", note: "Checkout completed — payment is processing", createdBy: "stripe" } },
    },
  });
  if (order.cartId) {
    await db.cartItem.deleteMany({
      where: { cartId: order.cartId, variantId: { in: order.items.map((i) => i.variantId).filter(Boolean) as string[] } },
    });
  }
  const mail = emails.orderReceived(toEmailData(order));
  await sendEmail({ to: order.email, template: "order-received", orderId, ...mail });
}

export async function recordRefund(paymentIntentId: string, amountRefunded: number) {
  const payment = await db.payment.findUnique({ where: { providerPaymentId: paymentIntentId }, include: { order: true } });
  if (!payment) return null;
  if (payment.refundedAmount >= amountRefunded) return payment; // already recorded
  const full = amountRefunded >= payment.amount;
  const delta = amountRefunded - payment.refundedAmount;
  await db.$transaction([
    db.payment.update({
      where: { id: payment.id },
      data: { refundedAmount: amountRefunded, status: full ? "REFUNDED" : "PARTIALLY_REFUNDED" },
    }),
    db.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: full ? "REFUNDED" : "PARTIALLY_REFUNDED",
        ...(full ? { status: "REFUNDED" } : {}),
        history: {
          create: {
            status: full ? "REFUNDED" : payment.order.status,
            note: `Refund of ${(delta / 100).toFixed(2)} € confirmed by Stripe${full ? " (full)" : ""}`,
            createdBy: "stripe",
          },
        },
      },
    }),
  ]);
  const mail = emails.refundIssued({ orderNumber: payment.order.orderNumber, firstName: payment.order.firstName, amount: delta });
  await sendEmail({ to: payment.order.email, template: "refund", orderId: payment.orderId, ...mail });
  return payment;
}

export { variantLabel };
