import type { Metadata } from "next";
import { ProductListing } from "@/components/product/product-listing";

export const metadata: Metadata = {
  title: "New Arrivals",
  description: "The latest additions to the EXEPRA edit.",
  alternates: { canonical: "/new-arrivals" },
};

export default async function NewArrivalsPage({ searchParams }: PageProps<"/new-arrivals">) {
  const sp = await searchParams;
  return (
    <ProductListing
      title="New Arrivals"
      description="Freshly added pieces from the last few weeks."
      crumbs={[{ label: "New Arrivals" }]}
      base={{ newArrivals: true }}
      basePath="/new-arrivals"
      searchParams={{ sort: "newest", ...sp }}
      emptyMessage="No new arrivals right now — check back soon."
    />
  );
}
