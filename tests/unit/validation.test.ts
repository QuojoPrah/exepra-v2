import { describe, expect, it } from "vitest";
import { addressSchema, checkoutSchema, isValidPostalCode, passwordSchema, slugify } from "@/lib/validation";
import { discountPercent, formatPrice, parseEuroToCents } from "@/lib/money";
import { generateOrderNumber } from "@/lib/orders";
import { sniffImageType } from "@/lib/storage";

const address = { firstName: "Erika", lastName: "Mustermann", street: "Musterstraße", houseNumber: "12a", postalCode: "10115", city: "Berlin", country: "DE" };

describe("address validation", () => {
  it("accepts a German address", () => {
    expect(addressSchema.safeParse(address).success).toBe(true);
  });
  it("validates postal codes per country", () => {
    expect(isValidPostalCode("DE", "1011")).toBe(false);
    expect(isValidPostalCode("AT", "1010")).toBe(true);
    expect(isValidPostalCode("NL", "1012 AB")).toBe(true);
    expect(isValidPostalCode("PL", "00-950")).toBe(true);
    expect(addressSchema.safeParse({ ...address, postalCode: "ABCDE" }).success).toBe(false);
  });
  it("rejects unsupported countries", () => {
    expect(addressSchema.safeParse({ ...address, country: "US", postalCode: "10001" }).success).toBe(false);
  });
});

describe("checkout validation", () => {
  const base = { email: "Erika@Example.com", firstName: "Erika", lastName: "M", shipping: address, shippingMethod: "de-standard", billingSameAsShipping: true, acceptTerms: true };
  it("normalises email and requires terms", () => {
    const r = checkoutSchema.safeParse(base);
    expect(r.success && r.data.email).toBe("erika@example.com");
    expect(checkoutSchema.safeParse({ ...base, acceptTerms: false }).success).toBe(false);
  });
  it("requires a billing address when different from shipping", () => {
    expect(checkoutSchema.safeParse({ ...base, billingSameAsShipping: false }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...base, billingSameAsShipping: false, billing: address }).success).toBe(true);
  });
  it("validates VAT IDs", () => {
    expect(checkoutSchema.safeParse({ ...base, vatId: "DE123456789" }).success).toBe(true);
    expect(checkoutSchema.safeParse({ ...base, vatId: "123" }).success).toBe(false);
  });
});

describe("helpers", () => {
  it("enforces password strength", () => {
    expect(passwordSchema.safeParse("short1").success).toBe(false);
    expect(passwordSchema.safeParse("onlyletterslong").success).toBe(false);
    expect(passwordSchema.safeParse("letters-and-1-digit").success).toBe(true);
  });
  it("slugifies German text", () => {
    expect(slugify("Damen Kleid – Größe M")).toBe("damen-kleid-grosse-m");
    expect(slugify("  Straße & Co.  ")).toBe("strasse-co");
  });
  it("formats and parses euros", () => {
    expect(formatPrice(4990).replace(/\s/g, " ")).toBe("49,90 €");
    expect(parseEuroToCents("49,90")).toBe(4990);
    expect(parseEuroToCents("49.9")).toBe(4990);
    expect(parseEuroToCents("abc")).toBeNull();
    expect(discountPercent(7900, 9900)).toBe(20);
    expect(discountPercent(7900, null)).toBeNull();
  });
  it("generates readable order numbers", () => {
    expect(generateOrderNumber(new Date("2026-11-13T10:00:00Z"))).toMatch(/^EX261113-[A-HJ-NP-Z2-9]{5}$/);
  });
  it("sniffs image types from magic bytes", () => {
    expect(sniffImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe("image/jpeg");
    expect(sniffImageType(Buffer.from("<svg onload=alert(1)>     "))).toBeNull();
  });
});
