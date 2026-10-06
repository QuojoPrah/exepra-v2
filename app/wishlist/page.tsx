"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { products } from "@/lib/products";

const WISHLIST_STORAGE_KEY = "exepra-wishlist-v1";
const CART_STORAGE_KEY = "exepra-cart-v2";

type CartItem = {
  id: number;
  name: string;
  category: string;
  image: string;
  price: number;
  quantity: number;
};

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadWishlist = () => {
      try {
        const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);

        setWishlistIds(stored ? JSON.parse(stored) : []);
      } catch {
        setWishlistIds([]);
      }

      setLoaded(true);
    };

    loadWishlist();

    window.addEventListener("wishlist-updated", loadWishlist);

    return () => {
      window.removeEventListener("wishlist-updated", loadWishlist);
    };
  }, []);

  const wishlistProducts = products.filter((product) =>
    wishlistIds.includes(String(product.id))
  );

  const removeFromWishlist = (id: number) => {
    const updatedWishlist = wishlistIds.filter(
      (wishlistId) => wishlistId !== String(id)
    );

    setWishlistIds(updatedWishlist);

    localStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify(updatedWishlist)
    );

    window.dispatchEvent(new Event("wishlist-updated"));
  };

  const clearWishlist = () => {
    setWishlistIds([]);

    localStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify([])
    );

    window.dispatchEvent(new Event("wishlist-updated"));
  };

  const addToCart = (product: (typeof products)[number]) => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);

      const cart: CartItem[] = stored ? JSON.parse(stored) : [];

      const existingItem = cart.find(
        (item) => item.id === product.id
      );

      let updatedCart: CartItem[];

      if (existingItem) {
        updatedCart = cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      } else {
        updatedCart = [
          ...cart,
          {
            id: product.id,
            name: product.name,
            category: product.category,
            image: product.image,
            price: product.price,
            quantity: 1,
          },
        ];
      }

      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(updatedCart)
      );

      window.dispatchEvent(new Event("cart-updated"));
    } catch {
      console.error("Unable to add product to cart.");
    }
  };

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#FAFAF8]" />
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8]">

      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>

          <div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Your Collection
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Wishlist
              </h1>

              <p className="mt-3 max-w-xl text-base leading-7 text-slate-500">
                Save the pieces you love and come back to them whenever
                you're ready.
              </p>
            </div>

            {wishlistProducts.length > 0 && (
              <button
                type="button"
                onClick={clearWishlist}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-red-500"
              >
                <Trash2 size={16} />
                Clear Wishlist
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

        {wishlistProducts.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Heart
                size={28}
                strokeWidth={1.5}
                className="text-slate-500"
              />
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-slate-950">
              Your wishlist is empty
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Discover something you love and tap the heart to save it
              here for later.
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-yellow-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-yellow-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-950 hover:shadow-xl"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <>
            {/* Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">
                  {wishlistProducts.length}
                </span>{" "}
                {wishlistProducts.length === 1
                  ? "item"
                  : "items"}{" "}
                saved
              </p>
            </div>

            {/* Product Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />

                    {product.sale && (
                      <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                        SALE
                      </span>
                    )}

                    <button
                      type="button"
                      aria-label={`Remove ${product.name} from wishlist`}
                      onClick={() =>
                        removeFromWishlist(product.id)
                      }
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-500 shadow-lg transition hover:scale-105"
                    >
                      <Heart
                        size={18}
                        fill="currentColor"
                      />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {product.category}
                    </p>

                    <Link
                      href={`/products/${product.id}`}
                      className="block"
                    >
                      <h3 className="mt-2 line-clamp-2 min-h-[56px] text-lg font-semibold text-slate-900 transition hover:text-yellow-700">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mt-4 flex items-center gap-2">
                      {product.oldPrice && (
                        <span className="text-sm text-slate-400 line-through">
                          €{product.oldPrice}
                        </span>
                      )}

                      <span className="text-xl font-bold text-slate-950">
                        €{product.price}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-950 hover:text-white"
                    >
                      <ShoppingBag size={17} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Trust Bar */}
      <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid md:grid-cols-3">

            <div className="flex items-center gap-4 border-b border-slate-200 px-6 py-6 md:border-b-0 md:border-r">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <ShoppingBag
                  size={20}
                  className="text-slate-900"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Curated Products
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Selected with you in mind
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 border-b border-slate-200 px-6 py-6 md:border-b-0 md:border-r">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <Heart
                  size={20}
                  className="text-slate-900"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Save Your Favorites
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Come back whenever you're ready
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <ShoppingBag
                  size={20}
                  className="text-slate-900"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Easy Shopping
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Add your favorites to cart anytime
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}