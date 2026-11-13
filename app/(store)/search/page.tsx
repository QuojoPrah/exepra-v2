import type { Metadata } from "next";
import { ProductListing } from "@/components/product/product-listing";
import { SearchBox } from "@/components/product/search-box";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  return (
    <>
      <div className="container-page pt-10">
        <SearchBox initial={q} />
      </div>
      <ProductListing
        title={q ? `Results for “${q}”` : "Search"}
        crumbs={[{ label: "Search" }]}
        base={{}}
        basePath="/search"
        searchParams={sp}
        emptyMessage={q ? `We couldn't find anything for “${q}”. Try a different spelling or a broader term such as “dress”, “kids” or “bag”.` : "Type a search term above to find products."}
      />
    </>
  );
}
