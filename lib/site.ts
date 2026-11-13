export const SITE_NAME = "EXEPRA";

export function siteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}

/** Fallback image used when a product or category has no image. */
export const FALLBACK_IMAGE = "/images/placeholder.svg";
