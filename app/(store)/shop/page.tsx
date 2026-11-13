import type { Metadata } from "next";
import { ProductListing } from "@/components/product/product-listing";

export const metadata: Metadata = {
  title: "Shop all",
  description: "Browse the full EXEPRA range of women's and children's fashion, accessories and home essentials.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  return (
    <ProductListing
      title="Shop all"
      description="Every piece in our current edit — filter by size, colour or price to find your favourites."
      crumbs={[{ label: "Shop" }]}
      base={{}}
      basePath="/shop"
      searchParams={await searchParams}
    />
  );
}
