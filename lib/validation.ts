import { z } from "zod";

export const SUPPORTED_COUNTRIES = [
  { code: "DE", name: "Germany" },
  { code: "AT", name: "Austria" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "FR", name: "France" },
  { code: "LU", name: "Luxembourg" },
  { code: "DK", name: "Denmark" },
  { code: "PL", name: "Poland" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
] as const;

const POSTAL_PATTERNS: Record<string, RegExp> = {
  DE: /^\d{5}$/,
  AT: /^\d{4}$/,
  NL: /^\d{4}\s?[A-Za-z]{2}$/,
  BE: /^\d{4}$/,
  FR: /^\d{5}$/,
  LU: /^(L-)?\d{4}$/i,
  DK: /^\d{4}$/,
  PL: /^\d{2}-\d{3}$/,
  IT: /^\d{5}$/,
  ES: /^\d{5}$/,
};

export function isValidPostalCode(country: string, postalCode: string) {
  const pattern = POSTAL_PATTERNS[country.toUpperCase()];
  return pattern ? pattern.test(postalCode.trim()) : postalCode.trim().length >= 3;
}

const text = (max: number) => z.string().trim().max(max);
const required = (label: string, max = 120) => text(max).min(1, `${label} is required.`);

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .email("Please enter a valid email address.");

export const phoneSchema = z
  .string()
  .trim()
  .max(30)
  .regex(/^[+()\d\s/-]*$/, "Please enter a valid phone number.")
  .optional()
  .or(z.literal(""));

export const addressSchema = z
  .object({
    firstName: required("First name", 80),
    lastName: required("Last name", 80),
    company: text(120).optional().or(z.literal("")),
    street: required("Street", 120),
    houseNumber: required("House number", 20),
    addressLine2: text(120).optional().or(z.literal("")),
    postalCode: required("Postal code", 12),
    city: required("City", 80),
    country: z.enum(SUPPORTED_COUNTRIES.map((c) => c.code) as [string, ...string[]], {
      message: "Please choose a supported country.",
    }),
    phone: phoneSchema,
  })
  .superRefine((value, ctx) => {
    if (!isValidPostalCode(value.country, value.postalCode)) {
      ctx.addIssue({ code: "custom", path: ["postalCode"], message: "Please enter a valid postal code." });
    }
  });

export type AddressInput = z.infer<typeof addressSchema>;

export const checkoutSchema = z
  .object({
    email: emailSchema,
    firstName: required("First name", 80),
    lastName: required("Last name", 80),
    phone: phoneSchema,
    shipping: addressSchema,
    shippingMethod: required("Delivery method", 40),
    billingSameAsShipping: z.boolean(),
    billing: addressSchema.optional(),
    vatId: text(30)
      .regex(/^[A-Za-z]{2}[A-Za-z0-9]{2,13}$/, "Please enter a valid VAT ID (e.g. DE123456789).")
      .optional()
      .or(z.literal("")),
    customerNote: text(500).optional().or(z.literal("")),
    acceptTerms: z.literal(true, { message: "Please accept the terms and conditions." }),
  })
  .superRefine((value, ctx) => {
    if (!value.billingSameAsShipping && !value.billing) {
      ctx.addIssue({ code: "custom", path: ["billing"], message: "Billing address is required." });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const newsletterSchema = z.object({
  email: emailSchema,
  consent: z.literal(true, { message: "Please confirm that you agree to receive our newsletter." }),
  source: text(40).optional(),
});

export const contactSchema = z.object({
  name: required("Name", 100),
  email: emailSchema,
  subject: required("Subject", 150),
  message: required("Message", 4000).min(10, "Please write at least 10 characters."),
});

export const reviewSchema = z.object({
  productId: required("Product", 40),
  rating: z.coerce.number().int().min(1).max(5),
  title: text(120).optional().or(z.literal("")),
  body: required("Review", 2000).min(10, "Please write at least 10 characters."),
  displayName: required("Display name", 60),
});

export const cartMutationSchema = z.object({
  variantId: required("Variant", 40),
  quantity: z.coerce.number().int().min(0).max(99),
});

export const trackOrderSchema = z.object({
  orderNumber: required("Order number", 40).transform((v) => v.toUpperCase()),
  email: emailSchema,
});

export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(128)
  .regex(/[a-zA-Z]/, "Include at least one letter.")
  .regex(/\d/, "Include at least one number.");

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/ß/g, "ss")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Flatten zod errors into { "shipping.postalCode": "message" } */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
