/**
 * Pure pricing engine. Used by the cart, checkout and order creation on the
 * server, so the final amount charged never depends on client calculations.
 * All amounts are integer cents, gross (VAT included).
 */

export type PricingLine = {
  unitPrice: number;
  quantity: number;
  vatRate: number;
};

export type CouponRule = {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderValue: number | null;
  startsAt: Date | null;
  expiresAt: Date | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
};

export type ShippingRule = {
  code: string;
  name: string;
  description: string | null;
  countries: string[];
  price: number;
  freeOver: number | null;
  minDays: number;
  maxDays: number;
  isActive: boolean;
  sortOrder: number;
};

export type ShippingOption = {
  code: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number;
  minDays: number;
  maxDays: number;
  freeOver: number | null;
};

export type CouponCheck =
  | { valid: true; discount: number }
  | { valid: false; reason: string };

export function lineTotal(line: PricingLine): number {
  return line.unitPrice * line.quantity;
}

export function subtotalOf(lines: PricingLine[]): number {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

export function evaluateCoupon(
  coupon: CouponRule | null | undefined,
  subtotal: number,
  now: Date = new Date(),
): CouponCheck {
  if (!coupon) return { valid: false, reason: "This code does not exist." };
  if (!coupon.isActive) return { valid: false, reason: "This code is no longer active." };
  if (coupon.startsAt && coupon.startsAt > now) return { valid: false, reason: "This code is not active yet." };
  if (coupon.expiresAt && coupon.expiresAt <= now) return { valid: false, reason: "This code has expired." };
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, reason: "This code has reached its usage limit." };
  }
  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    return {
      valid: false,
      reason: `This code requires a minimum order of ${(coupon.minOrderValue / 100).toFixed(2).replace(".", ",")} €.`,
    };
  }
  const raw =
    coupon.type === "PERCENTAGE"
      ? Math.round((subtotal * Math.min(Math.max(coupon.value, 0), 100)) / 100)
      : coupon.value;
  return { valid: true, discount: Math.max(0, Math.min(raw, subtotal)) };
}

export function shippingOptionsFor(
  rules: ShippingRule[],
  country: string,
  merchandiseTotal: number,
): ShippingOption[] {
  return rules
    .filter((r) => r.isActive && r.countries.includes(country.toUpperCase()))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.price - b.price)
    .map((r) => ({
      code: r.code,
      name: r.name,
      description: r.description,
      originalPrice: r.price,
      price: r.freeOver !== null && merchandiseTotal >= r.freeOver ? 0 : r.price,
      minDays: r.minDays,
      maxDays: r.maxDays,
      freeOver: r.freeOver,
    }));
}

/** VAT contained in a gross amount. */
export function includedVat(gross: number, ratePercent: number): number {
  if (ratePercent <= 0) return 0;
  return Math.round((gross * ratePercent) / (100 + ratePercent));
}

export type Totals = {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode: string | null;
  couponError: string | null;
  shippingOption: ShippingOption | null;
};

export function computeTotals(input: {
  lines: PricingLine[];
  coupon?: CouponRule | null;
  couponCode?: string | null;
  shippingRules: ShippingRule[];
  country?: string;
  shippingCode?: string | null;
  defaultVatRate?: number;
  now?: Date;
}): Totals {
  const subtotal = subtotalOf(input.lines);
  const vatDefault = input.defaultVatRate ?? 19;

  let discount = 0;
  let couponCode: string | null = null;
  let couponError: string | null = null;
  if (input.couponCode) {
    const check = evaluateCoupon(input.coupon, subtotal, input.now);
    if (check.valid) {
      discount = check.discount;
      couponCode = input.coupon!.code;
    } else {
      couponError = check.reason;
    }
  }

  const merchandise = subtotal - discount;
  const options = shippingOptionsFor(input.shippingRules, input.country ?? "DE", merchandise);
  const shippingOption =
    (input.shippingCode && options.find((o) => o.code === input.shippingCode)) || options[0] || null;
  const shipping = input.lines.length === 0 ? 0 : (shippingOption?.price ?? 0);

  // Allocate the discount proportionally so VAT is computed on what is actually paid.
  let tax = 0;
  let allocated = 0;
  input.lines.forEach((line, i) => {
    const gross = lineTotal(line);
    const share =
      i === input.lines.length - 1
        ? discount - allocated
        : subtotal > 0
          ? Math.round((discount * gross) / subtotal)
          : 0;
    allocated += share;
    tax += includedVat(gross - share, line.vatRate);
  });
  tax += includedVat(shipping, vatDefault);

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: merchandise + shipping,
    couponCode,
    couponError,
    shippingOption: input.lines.length === 0 ? null : shippingOption,
  };
}
