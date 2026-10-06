"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { products } from "@/lib/products";

const WISHLIST_STORAGE_KEY = "exepra-wishlist-v1";

export default function BestSellers() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  const bestSellers = products.filter(
    (product) => product.bestseller
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);

      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch {
      setWishlist([]);
    }
  }, []);

  const toggleWishlist = (id: string) => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);

      const currentWishlist: string[] = stored
        ? JSON.parse(stored)
        : [];

      const updatedWishlist = currentWishlist.includes(id)
        ? currentWishlist.filter((itemId) => itemId !== id)
        : [...currentWishlist, id];

      localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(updatedWishlist)
      );

      setWishlist(updatedWishlist);

      window.dispatchEvent(new Event("wishlist-updated"));
    } catch {
      console.error("Unable to update wishlist.");
    }
  };

  return (
    <section className="bg-[#FAFAF8] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-slate-400">
            BEST SELLERS
          </p>

          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Everyone&apos;s favorite
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-500 md:text-lg">
            Discover the products our customers love most.
          </p>
        </motion.div>

        {/* ================================================== */}
        {/* PRODUCT GRID */}
        {/* ================================================== */}

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bestSellers.map((product, index) => {
            const productId = String(product.id);
            const isWishlisted = wishlist.includes(productId);

            return (
              <motion.article
                key={product.id}
                initial={{
                  opacity: 0,
                  y: 24,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                whileHover={{
                  y: -6,
                }}
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                transition={{
                  opacity: {
                    duration: 0.55,
                    delay: index * 0.04,
                  },
                  y: {
                    type: "spring",
                    stiffness: 220,
                    damping: 22,
                  },
                }}
                className="group overflow-hidden rounded-[22px] border border-slate-200/70 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-shadow duration-500 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    priority={index < 4}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                  />

                  {/* Subtle Image Overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-60" />

                  {/* Product Badge */}
                  {product.badge && (
                    <div className="absolute left-4 top-4">
                      <span className="inline-flex rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-800 shadow-sm backdrop-blur-md">
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Wishlist */}
                  <button
                    type="button"
                    aria-label={
                      isWishlisted
                        ? `Remove ${product.name} from wishlist`
                        : `Add ${product.name} to wishlist`
                    }
                    onClick={() => toggleWishlist(productId)}
                    className={`group/wishlist absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${
                      isWishlisted
                        ? "border-yellow-700 bg-yellow-700 text-white shadow-md"
                        : "border-white/60 bg-white/80 text-slate-700 hover:bg-white hover:text-yellow-700"
                    }`}
                  >
                    <Heart
                      className="h-[18px] w-[18px] transition-transform duration-300 group-hover/wishlist:scale-110"
                      strokeWidth={1.7}
                      fill={
                        isWishlisted
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                </div>

                {/* Product Information */}
                <div className="px-5 pb-6 pt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {product.category}
                  </p>

                  <h3 className="mt-2 text-lg font-semibold leading-snug text-slate-900">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className="text-[13px] tracking-[0.08em] text-amber-400"
                      aria-label={`Rated ${product.rating} out of 5`}
                    >
                      ★★★★★
                    </span>

                    <span className="text-xs text-slate-400">
                      {product.rating.toFixed(1)} ·{" "}
                      {product.reviews} reviews
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-lg font-semibold tracking-tight text-slate-900">
                      €{product.price}
                    </span>

                    {product.oldPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        €{product.oldPrice}
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}