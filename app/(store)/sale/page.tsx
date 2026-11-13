import type { Metadata } from "next";
import { ProductListing } from "@/components/product/product-listing";

export const metadata: Metadata = {
  title: "Sale",
  description: "Reduced pieces from the EXEPRA edit, while stocks last.",
  alternates: { canonical: "/sale" },
};

export default async function SalePage({ searchParams }: PageProps<"/sale">) {
  return (
    <ProductListing
      title="Sale"
      description="Selected favourites at reduced prices — while stocks last."
      crumbs={[{ label: "Sale" }]}
      base={{ onSale: true }}
      basePath="/sale"
      searchParams={await searchParams}
      emptyMessage="There's no sale running at the moment."
    />
  );
}
