import ProductCard from "@/components/product/product-card";
import type { ProductSummary } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export default function ProductGrid({ products, className, priorityCount = 0 }: { products: ProductSummary[]; className?: string; priorityCount?: number }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4", className)}>
      {products.map((p, i) => (
        <li key={p.id} className="relative">
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
