import { SORT_OPTIONS, type ListingFilters, type SortValue } from "@/lib/catalog";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : v ? [v] : [])
    .flatMap((x) => x.split(","))
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 20);

const euros = (v: string | undefined) => {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined;
};

export function parseListingParams(sp: RawSearchParams): ListingFilters & { categoryFilter?: string } {
  const sort = first(sp.sort);
  const page = Number(first(sp.page) ?? 1);
  return {
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? (sort as SortValue) : "featured",
    page: Number.isInteger(page) && page > 0 ? Math.min(page, 500) : 1,
    sizes: list(sp.size),
    colors: list(sp.color),
    minPrice: euros(first(sp.min)),
    maxPrice: euros(first(sp.max)),
    inStock: first(sp.stock) === "1",
    q: first(sp.q)?.slice(0, 80),
    categoryFilter: first(sp.category)?.slice(0, 60),
  };
}
