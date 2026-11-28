import ProductCard from "@/components/product/product-card";
import { Stagger } from "@/components/motion/reveal";
import type { ProductSummary } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export default function ProductGrid({ products, className, priorityCount = 0 }: { products: ProductSummary[]; className?: string; priorityCount?: number }) {
  return (
    <Stagger className={cn("grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4", className)} itemClassName="relative" stagger={0.07}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </Stagger>
  );
}
