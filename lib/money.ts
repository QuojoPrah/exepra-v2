const eur = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

/** Format integer cents as a EUR string, e.g. 4990 → "49,90 €". */
export function formatPrice(cents: number): string {
  return eur.format(cents / 100);
}

/** Parse a user-entered euro amount ("49,90" or "49.90") into cents. */
export function parseEuroToCents(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined || input === "") return null;
  const normalized = String(input).trim().replace(/\s|€/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

export function centsToEuroInput(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "";
  return (cents / 100).toFixed(2);
}

export function discountPercent(price: number, compareAt?: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
