import ProductGrid from "@/components/product/product-grid";
import { SectionHeading } from "@/components/home/section-heading";
import type { ProductSummary } from "@/lib/catalog";

export default function BestSellers({ products }: { products: ProductSummary[] }) {
  if (!products.length) return null;
  return (
    <section className="bg-white py-20 sm:py-28" aria-labelledby="bestsellers-heading">
      <div className="container-page">
        <div id="bestsellers-heading">
          <SectionHeading eyebrow="Most loved" title="Best Sellers" description="The pieces our customers come back for, again and again." href="/shop?sort=best-selling" linkLabel="View all products" />
        </div>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
