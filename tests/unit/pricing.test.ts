import { describe, expect, it } from "vitest";
import { computeTotals, evaluateCoupon, includedVat, shippingOptionsFor, type CouponRule, type ShippingRule } from "@/lib/pricing";

const rules: ShippingRule[] = [
  { code: "de-standard", name: "Standard", description: null, countries: ["DE"], price: 495, freeOver: 7500, minDays: 2, maxDays: 4, isActive: true, sortOrder: 1 },
  { code: "de-express", name: "Express", description: null, countries: ["DE"], price: 995, freeOver: null, minDays: 1, maxDays: 2, isActive: true, sortOrder: 2 },
  { code: "eu", name: "EU", description: null, countries: ["AT", "NL"], price: 995, freeOver: 12000, minDays: 4, maxDays: 7, isActive: true, sortOrder: 3 },
  { code: "off", name: "Disabled", description: null, countries: ["DE"], price: 0, freeOver: null, minDays: 1, maxDays: 1, isActive: false, sortOrder: 0 },
];

const coupon = (over: Partial<CouponRule> = {}): CouponRule => ({
  code: "SAVE10", type: "PERCENTAGE", value: 10, minOrderValue: null, startsAt: null, expiresAt: null, usageLimit: null, usageCount: 0, isActive: true, ...over,
});

describe("includedVat", () => {
  it("extracts 19% VAT from a gross amount", () => {
    expect(includedVat(11900, 19)).toBe(1900);
    expect(includedVat(495, 19)).toBe(79);
    expect(includedVat(1000, 0)).toBe(0);
  });
});

describe("evaluateCoupon", () => {
  const now = new Date("2026-06-01T12:00:00Z");
  it("applies a percentage discount", () => {
    expect(evaluateCoupon(coupon(), 7900, now)).toEqual({ valid: true, discount: 790 });
  });
  it("caps a fixed discount at the subtotal", () => {
    expect(evaluateCoupon(coupon({ type: "FIXED", value: 10000 }), 4000, now)).toEqual({ valid: true, discount: 4000 });
  });
  it("rejects missing, inactive, expired, not-started and exhausted codes", () => {
    expect(evaluateCoupon(null, 1000, now).valid).toBe(false);
    expect(evaluateCoupon(coupon({ isActive: false }), 1000, now).valid).toBe(false);
    expect(evaluateCoupon(coupon({ expiresAt: new Date("2026-05-01") }), 1000, now).valid).toBe(false);
    expect(evaluateCoupon(coupon({ startsAt: new Date("2026-07-01") }), 1000, now).valid).toBe(false);
    expect(evaluateCoupon(coupon({ usageLimit: 5, usageCount: 5 }), 1000, now).valid).toBe(false);
  });
  it("enforces the minimum order value", () => {
    const r = evaluateCoupon(coupon({ minOrderValue: 5000 }), 4999, now);
    expect(r.valid).toBe(false);
    expect(evaluateCoupon(coupon({ minOrderValue: 5000 }), 5000, now).valid).toBe(true);
  });
});

describe("shippingOptionsFor", () => {
  it("returns only active rates for the destination, sorted", () => {
    expect(shippingOptionsFor(rules, "DE", 1000).map((o) => o.code)).toEqual(["de-standard", "de-express"]);
    expect(shippingOptionsFor(rules, "at", 1000).map((o) => o.code)).toEqual(["eu"]);
    expect(shippingOptionsFor(rules, "US", 1000)).toEqual([]);
  });
  it("applies free-shipping thresholds", () => {
    expect(shippingOptionsFor(rules, "DE", 7499)[0].price).toBe(495);
    expect(shippingOptionsFor(rules, "DE", 7500)[0].price).toBe(0);
    expect(shippingOptionsFor(rules, "DE", 7500)[1].price).toBe(995);
  });
});

describe("computeTotals", () => {
  const lines = [{ unitPrice: 7900, quantity: 1, vatRate: 19 }];

  it("computes subtotal, shipping, VAT and total", () => {
    const t = computeTotals({ lines: [{ unitPrice: 2900, quantity: 2, vatRate: 19 }], shippingRules: rules });
    expect(t).toMatchObject({ subtotal: 5800, discount: 0, shipping: 495, total: 6295 });
    expect(t.tax).toBe(includedVat(5800, 19) + includedVat(495, 19));
  });

  it("evaluates the free-shipping threshold after the discount", () => {
    const t = computeTotals({ lines, coupon: coupon(), couponCode: "SAVE10", shippingRules: rules });
    expect(t).toMatchObject({ subtotal: 7900, discount: 790, shipping: 495, total: 7605, couponCode: "SAVE10", couponError: null });
    expect(t.tax).toBe(1214);
  });

  it("reports coupon errors without applying them", () => {
    const t = computeTotals({ lines, coupon: coupon({ isActive: false }), couponCode: "SAVE10", shippingRules: rules });
    expect(t.discount).toBe(0);
    expect(t.couponError).toMatch(/no longer active/);
  });

  it("uses the requested shipping method when available", () => {
    expect(computeTotals({ lines, shippingRules: rules, shippingCode: "de-express" }).shipping).toBe(995);
    expect(computeTotals({ lines, shippingRules: rules, shippingCode: "nope" }).shippingOption?.code).toBe("de-standard");
  });

  it("charges nothing for an empty cart", () => {
    expect(computeTotals({ lines: [], shippingRules: rules })).toMatchObject({ subtotal: 0, shipping: 0, total: 0, shippingOption: null });
  });

  it("allocates discounts across mixed VAT rates", () => {
    const t = computeTotals({
      lines: [{ unitPrice: 10000, quantity: 1, vatRate: 19 }, { unitPrice: 10000, quantity: 1, vatRate: 7 }],
      coupon: coupon({ type: "FIXED", value: 2000 }),
      couponCode: "SAVE10",
      shippingRules: rules,
    });
    expect(t.total).toBe(18000);
    expect(t.tax).toBe(includedVat(9000, 19) + includedVat(9000, 7));
  });
});
