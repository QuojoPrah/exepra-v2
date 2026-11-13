import Image from "next/image";
import Link from "next/link";
import { SearchX } from "lucide-react";
import ProductGrid from "@/components/product/product-grid";
import { ListingFilters } from "@/components/product/listing-filters";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { buttonClasses } from "@/components/ui/button";
import { getFacets, getNavCategories, getProductListing, SORT_OPTIONS, type ListingFilters as Filters } from "@/lib/catalog";
import { parseListingParams, type RawSearchParams } from "@/lib/listing-params";

type Base = Pick<Filters, "category" | "collection" | "onSale" | "newArrivals">;

export async function ProductListing({
  title,
  description,
  banner,
  crumbs,
  base,
  searchParams,
  basePath,
  emptyMessage,
}: {
  title: string;
  description?: string | null;
  banner?: string | null;
  crumbs: Crumb[];
  base: Base;
  searchParams: RawSearchParams;
  basePath: string;
  emptyMessage?: string;
}) {
  const params = parseListingParams(searchParams);
  const scope = { ...base, category: base.category ?? params.categoryFilter };
  const [listing, facets, categories] = await Promise.all([
    getProductListing({ ...params, ...scope }),
    getFacets({ ...scope, q: params.q }),
    base.category ? Promise.resolve([]) : getNavCategories(),
  ]);

  const pageHref = (page: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === "page" || v === undefined) continue;
      sp.set(k, Array.isArray(v) ? v.join(",") : v);
    }
    if (page > 1) sp.set("page", String(page));
    const qs = sp.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      {banner ? (
        <header className="relative isolate -mt-px flex min-h-[300px] items-end overflow-hidden bg-ink text-white sm:min-h-[360px]">
          <Image src={banner} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/30 to-black/10" aria-hidden />
          <div className="container-page pb-10 pt-24">
            <Breadcrumbs items={crumbs} light />
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{title}</h1>
            {description && <p className="mt-3 max-w-xl text-white/85">{description}</p>}
          </div>
        </header>
      ) : (
        <header className="border-b border-line bg-cream/60">
          <div className="container-page py-10 sm:py-14">
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{title}</h1>
            {description && <p className="mt-3 max-w-xl text-muted">{description}</p>}
          </div>
        </header>
      )}

      <div className="container-page py-8 sm:py-10">
        <ListingFilters
          total={listing.total}
          facets={facets}
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
          sortOptions={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />

        {listing.products.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream">
              <SearchX className="h-7 w-7 text-bronze-deep" aria-hidden />
            </span>
            <h2 className="mt-5 text-xl font-semibold">Nothing here yet</h2>
            <p className="mt-2 text-sm text-muted">{emptyMessage ?? "No products match your current filters. Try removing a filter or browse our full range."}</p>
            <div className="mt-6 flex gap-3">
              <Link href={basePath} className={buttonClasses("outline")}>
                Clear filters
              </Link>
              <Link href="/shop" className={buttonClasses("primary")}>
                Shop all
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ProductGrid products={listing.products} className="mt-8" priorityCount={4} />
            {listing.pageCount > 1 && (
              <nav aria-label="Pagination" className="mt-16 flex items-center justify-center gap-2">
                {listing.page > 1 && (
                  <Link href={pageHref(listing.page - 1)} className={buttonClasses("outline", "sm")} rel="prev">
                    Previous
                  </Link>
                )}
                {Array.from({ length: listing.pageCount }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - listing.page) <= 2 || p === 1 || p === listing.pageCount)
                  .map((p) => (
                    <Link
                      key={p}
                      href={pageHref(p)}
                      aria-current={p === listing.page ? "page" : undefined}
                      className={`flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm ${p === listing.page ? "bg-ink text-white" : "hover:bg-cream"}`}
                    >
                      {p}
                    </Link>
                  ))}
                {listing.page < listing.pageCount && (
                  <Link href={pageHref(listing.page + 1)} className={buttonClasses("outline", "sm")} rel="next">
                    Next
                  </Link>
                )}
              </nav>
            )}
            <p className="mt-6 text-center text-xs text-muted">
              Showing {(listing.page - 1) * 12 + 1}–{Math.min(listing.page * 12, listing.total)} of {listing.total} products
            </p>
          </>
        )}
      </div>
    </>
  );
}
