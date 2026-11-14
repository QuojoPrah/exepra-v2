import { formatPrice } from "@/lib/money";

export const SMALL_BUSINESS_NOTE = "No VAT is charged (small business, § 19 UStG).";

/** Shows the VAT contained in a total, or the small-business notice when no VAT applies. */
export function vatNote(tax: number): string {
  return tax > 0 ? `Includes ${formatPrice(tax)} VAT.` : SMALL_BUSINESS_NOTE;
}
