"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Heart, Minus, Plus, Star, ShoppingBag, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { products } from "@/lib/products";

const CART_STORAGE_KEY = "exepra-cart-v2";

type CartItem = {
  id: number;
  name: string;
  category: string;
  image: string;
  price: number;
  quantity: number;
};

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const productId = Number(params.id);

  const product = products.find((item) => item.id === productId);

  // Product not found
  if (!product) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Product not found
          </h1>

          <p className="mt-3 text-slate-500">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-700"
          >
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  const handleAddToCart = () => {
    const existingCart: CartItem[] = JSON.parse(
      localStorage.getItem(CART_STORAGE_KEY) || "[]"
    );

    const existingItem = existingCart.find(
      (item) => item.id === product.id
    );

    let updatedCart: CartItem[];

    if (existingItem) {
      updatedCart = existingCart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + quantity,
            }
          : item
      );
    } else {
      updatedCart = [
        ...existingCart,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          image: product.image,
          price: product.price,
          quantity,
        },
      ];
    }

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(updatedCart)
    );

    // Update navbar cart badge
    window.dispatchEvent(new Event("cart-updated"));

    setAdded(true);

    // Go to cart
    setTimeout(() => {
      router.push("/cart");
    }, 300);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Back */}
      <div className="mx-auto max-w-7xl px-6 pt-8 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to shop
        </Link>
      </div>

      {/* Product */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image */}
          <div className="relative overflow-hidden rounded-[32px] bg-slate-100">
            {product.sale && (
              <span className="absolute left-6 top-6 z-10 rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white">
                SALE
              </span>
            )}

            <div className="relative aspect-square">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Information */}
          <div className="flex flex-col justify-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
              {product.category}
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-5 flex items-center gap-2">
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={18}
                    fill={
                      index < Math.round(product.rating)
                        ? "currentColor"
                        : "none"
                    }
                  />
                ))}
              </div>

              <span className="text-sm text-slate-500">
                {product.rating} · {product.reviews} reviews
              </span>
            </div>

            {/* Price */}
            <div className="mt-8 flex items-center gap-4">
              {product.oldPrice && (
                <span className="text-xl text-slate-400 line-through">
                  €{product.oldPrice}
                </span>
              )}

              <span className="text-4xl font-bold text-slate-950">
                €{product.price}
              </span>
            </div>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Designed with a clean, modern aesthetic, the{" "}
              {product.name} brings together thoughtful design,
              everyday functionality, and premium quality for your
              lifestyle.
            </p>

            {/* Divider */}
            <div className="my-8 h-px bg-slate-200" />

            {/* Quantity */}
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-900">
                Quantity
              </p>

              <div className="flex w-fit items-center overflow-hidden rounded-full border border-slate-200">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                  className="flex h-12 w-12 items-center justify-center transition hover:bg-slate-100"
                  aria-label="Decrease quantity"
                >
                  <Minus size={17} />
                </button>

                <span className="flex h-12 w-12 items-center justify-center text-sm font-semibold">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => current + 1)
                  }
                  className="flex h-12 w-12 items-center justify-center transition hover:bg-slate-100"
                  aria-label="Increase quantity"
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex h-14 flex-1 items-center justify-center gap-3 rounded-full bg-slate-950 px-8 text-base font-semibold text-white transition hover:bg-slate-800"
              >
                <ShoppingBag size={19} />

                {added ? "Added to Cart ✓" : "Add to Cart"}
              </button>

              <button
                type="button"
                aria-label="Add to wishlist"
                className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 transition hover:bg-slate-100"
              >
                <Heart size={20} />
              </button>
            </div>

            {/* Benefits */}
            <div className="mt-8 grid gap-4 border-t border-slate-200 pt-8 sm:grid-cols-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Free Shipping
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  On orders over €50
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Secure Payment
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Safe & encrypted
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Easy Returns
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  30-day returns
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}