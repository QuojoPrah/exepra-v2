/**
 * Integration tests against the configured DATABASE_URL (local Prisma Postgres).
 * They create their own uniquely named data and remove it afterwards.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import Stripe from "stripe";

process.env.STRIPE_SECRET_KEY ??= "sk_test_integration_dummy";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_integration_test_secret";

const { db } = await import("@/lib/db");
const { buildCartView } = await import("@/lib/cart");
const { createPendingOrder, markOrderPaid, releaseOrder, recordRefund, OrderError } = await import("@/lib/orders");
const { POST: webhookPOST } = await import("@/app/api/webhooks/stripe/route");

const tag = `itest-${Date.now()}`;
let productId: string;
let variantId: string;
const cartIds: string[] = [];

const checkoutInput = {
  email: `${tag}@example.com`,
  firstName: "Test",
  lastName: "Kunde",
  phone: "",
  shipping: { firstName: "Test", lastName: "Kunde", company: "", street: "Teststraße", houseNumber: "1", addressLine2: "", postalCode: "10115", city: "Berlin", country: "DE", phone: "" },
  shippingMethod: "de-standard",
  billingSameAsShipping: true,
  vatId: "",
  customerNote: "",
  acceptTerms: true as const,
};

async function cartWith(quantity: number, couponCode: string | null = null) {
  const cart = await db.cart.create({ data: { token: `${tag}-${Math.random()}`, couponCode, items: { create: { variantId, quantity } } } });
  cartIds.push(cart.id);
  return cart.id;
}

const stock = async () => (await db.productVariant.findUniqueOrThrow({ where: { id: variantId } })).stock;

beforeAll(async () => {
  if ((await db.shippingRate.count({ where: { code: "de-standard" } })) === 0) {
    throw new Error("Run `npm run db:seed` first — the de-standard shipping rate is required.");
  }
  const product = await db.product.create({
    data: {
      slug: tag,
      name: `Integration Product ${tag}`,
      description: "Integration test product",
      price: 2500,
      status: "ACTIVE",
      variants: { create: { sku: tag.toUpperCase(), stock: 5 } },
    },
    include: { variants: true },
  });
  productId = product.id;
  variantId = product.variants[0].id;
  await db.coupon.create({ data: { code: tag.toUpperCase(), type: "PERCENTAGE", value: 10, isActive: true } });
});

afterAll(async () => {
  const orders = await db.order.findMany({ where: { email: `${tag}@example.com` }, select: { id: true } });
  await db.emailLog.deleteMany({ where: { orderId: { in: orders.map((o) => o.id) } } });
  await db.order.deleteMany({ where: { email: `${tag}@example.com` } });
  await db.cart.deleteMany({ where: { id: { in: cartIds } } });
  await db.product.deleteMany({ where: { id: productId } });
  await db.coupon.deleteMany({ where: { code: tag.toUpperCase() } });
  await db.webhookEvent.deleteMany({ where: { id: { startsWith: `evt_${tag}` } } });
  await db.$disconnect();
});

describe("cart pricing from the database", () => {
  it("prices the cart server-side and flags quantities above stock", async () => {
    const cartId = await cartWith(7);
    const view = await buildCartView(cartId);
    expect(view.lines[0]).toMatchObject({ quantity: 5, issue: "reduced", unitPrice: 2500 });
    expect(view.subtotal).toBe(12500);
    expect(view.hasIssues).toBe(true);
  });
});

describe("order lifecycle", () => {
  let orderId: string;
  let cartId: string;

  it("creates a pending order and atomically reserves stock", async () => {
    cartId = await cartWith(2, tag.toUpperCase());
    const order = await createPendingOrder(checkoutInput, { cartId, userId: null });
    orderId = order.id;
    expect(order.status).toBe("PENDING");
    expect(order.subtotal).toBe(5000);
    expect(order.discountTotal).toBe(500);
    expect(order.shippingTotal).toBe(495);
    expect(order.total).toBe(4995);
    expect(order.items).toHaveLength(1);
    expect(await stock()).toBe(3);
    const movements = await db.inventoryMovement.findMany({ where: { orderId } });
    expect(movements.map((m) => m.delta)).toEqual([-2]);
  });

  it("refuses to oversell", async () => {
    const other = await cartWith(4);
    await expect(createPendingOrder(checkoutInput, { cartId: other, userId: null })).rejects.toBeInstanceOf(OrderError);
    expect(await stock()).toBe(3);
  });

  it("rejects an unavailable shipping method", async () => {
    const other = await cartWith(1);
    await expect(createPendingOrder({ ...checkoutInput, shippingMethod: "eu-standard" }, { cartId: other, userId: null })).rejects.toThrow(/delivery method/);
  });

  it("marks the order paid exactly once", async () => {
    const first = await markOrderPaid({ orderId, sessionId: `cs_${tag}`, paymentIntentId: `pi_${tag}`, amount: 4995, currency: "eur", method: "card" });
    const second = await markOrderPaid({ orderId, sessionId: `cs_${tag}`, paymentIntentId: `pi_${tag}`, amount: 4995, currency: "eur", method: "card" });
    expect(first.changed).toBe(true);
    expect(second.changed).toBe(false);
    const order = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: { payments: true, history: true } });
    expect(order).toMatchObject({ status: "PAID", paymentStatus: "PAID" });
    expect(order.payments).toHaveLength(1);
    expect(order.history.filter((h) => h.status === "PAID")).toHaveLength(1);
    expect((await db.product.findUniqueOrThrow({ where: { id: productId } })).salesCount).toBe(2);
    expect((await db.coupon.findUniqueOrThrow({ where: { code: tag.toUpperCase() } })).usageCount).toBe(1);
    expect(await db.cartItem.count({ where: { cartId } })).toBe(0);
    expect(await stock()).toBe(3); // stock was reserved at checkout, not decremented twice
  });

  it("refuses to cancel a paid order and records refunds idempotently", async () => {
    await expect(releaseOrder(orderId, { reason: "test", by: "test" })).rejects.toBeInstanceOf(OrderError);
    await recordRefund(`pi_${tag}`, 4995);
    await recordRefund(`pi_${tag}`, 4995);
    const order = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: { payments: true } });
    expect(order).toMatchObject({ status: "REFUNDED", paymentStatus: "REFUNDED" });
    expect(order.payments[0].refundedAmount).toBe(4995);
  });

  it("releases stock for abandoned orders exactly once", async () => {
    const c = await cartWith(1);
    const order = await createPendingOrder(checkoutInput, { cartId: c, userId: null });
    expect(await stock()).toBe(2);
    await releaseOrder(order.id, { reason: "expired", by: "test" });
    await releaseOrder(order.id, { reason: "expired", by: "test" });
    expect(await stock()).toBe(3);
    expect((await db.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe("CANCELLED");
  });
});

describe("Stripe webhook endpoint", () => {
  const stripe = new Stripe("sk_test_integration_dummy");
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;

  async function send(event: object, sig?: string) {
    const payload = JSON.stringify(event);
    const signature = sig ?? stripe.webhooks.generateTestHeaderString({ payload, secret });
    const res = await webhookPOST(new Request("http://localhost/api/webhooks/stripe", { method: "POST", body: payload, headers: { "stripe-signature": signature } }));
    return { status: res.status, body: await res.json() };
  }

  it("rejects requests without a valid signature", async () => {
    const r = await send({ id: "evt_bad", type: "checkout.session.completed" }, "t=1,v1=deadbeef");
    expect(r.status).toBe(400);
  });

  it("marks an order paid from a signed checkout.session.completed event, once", async () => {
    const c = await cartWith(1);
    const order = await createPendingOrder(checkoutInput, { cartId: c, userId: null });
    const event = {
      id: `evt_${tag}_paid`,
      object: "event",
      type: "checkout.session.completed",
      data: { object: { id: `cs_${tag}_wh`, object: "checkout.session", payment_status: "paid", amount_total: order.total, currency: "eur", payment_intent: `pi_${tag}_wh`, payment_method_types: ["card"], metadata: { orderId: order.id } } },
    };
    const first = await send(event);
    const duplicate = await send(event);
    expect(first).toMatchObject({ status: 200, body: { received: true } });
    expect(duplicate.body.duplicate).toBe(true);
    const updated = await db.order.findUniqueOrThrow({ where: { id: order.id }, include: { payments: true } });
    expect(updated.paymentStatus).toBe("PAID");
    expect(updated.payments).toHaveLength(1);
  });

  it("releases stock when a checkout session expires", async () => {
    const before = await stock();
    const c = await cartWith(1);
    const order = await createPendingOrder(checkoutInput, { cartId: c, userId: null });
    expect(await stock()).toBe(before - 1);
    const r = await send({ id: `evt_${tag}_exp`, object: "event", type: "checkout.session.expired", data: { object: { id: `cs_${tag}_exp`, object: "checkout.session", metadata: { orderId: order.id } } } });
    expect(r.status).toBe(200);
    expect(await stock()).toBe(before);
  });
});
