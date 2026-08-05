import ProductCard from "./product-card";
import { products } from "@/lib/products";

export default function ProductGrid() {
  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          name={product.name}
          category={product.category}
          image={product.image}
          price={product.price}
          oldPrice={product.oldPrice}
          rating={product.rating}
          reviews={product.reviews}
          sale={product.sale}
        />
      ))}
    </div>
  );
}