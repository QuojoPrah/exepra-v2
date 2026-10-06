"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Plus, Star } from "lucide-react";
import { useEffect, useState } from "react";

const WISHLIST_STORAGE_KEY = "exepra-wishlist-v1";

type ProductCardProps = {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  sale?: boolean;
};

export default function ProductCard({
  id,
  name,
  category,
  image,
  price,
  oldPrice,
  rating,
  reviews,
  sale,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);

      if (!stored) return;

      const wishlist: string[] = JSON.parse(stored);

      setIsWishlisted(wishlist.includes(id));
    } catch {
      setIsWishlisted(false);
    }
  }, [id]);

  const toggleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);

      const wishlist: string[] = stored ? JSON.parse(stored) : [];

      let updatedWishlist: string[];

      if (wishlist.includes(id)) {
        updatedWishlist = wishlist.filter((itemId) => itemId !== id);
        setIsWishlisted(false);
      } else {
        updatedWishlist = [...wishlist, id];
        setIsWishlisted(true);
      }

      localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(updatedWishlist)
      );

      window.dispatchEvent(new Event("wishlist-updated"));
    } catch {
      console.error("Unable to update wishlist.");
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white transition hover:-translate-y-2 hover:shadow-2xl">

      {/* Product Image */}
      <Link href={`/products/${id}`}>
        <div className="relative h-80 overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover transition duration-700 group-hover:scale-110"
          />

          {sale && (
            <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
              SALE
            </span>
          )}
        </div>
      </Link>

      {/* Wishlist */}
      <button
        type="button"
        aria-label={
          isWishlisted
            ? `Remove ${name} from wishlist`
            : `Add ${name} to wishlist`
        }
        onClick={toggleWishlist}
        className={`
          absolute
          right-4
          top-4
          z-10
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          bg-white
          shadow-lg
          transition-all
          duration-300
          hover:scale-105
          ${
            isWishlisted
              ? "text-red-500"
              : "text-slate-700 hover:text-red-500"
          }
        `}
      >
        <Heart
          size={18}
          strokeWidth={1.8}
          fill={isWishlisted ? "currentColor" : "none"}
        />
      </button>

      {/* Product Info */}
      <div className="p-6">
        <p className="text-sm uppercase tracking-wide text-slate-400">
          {category}
        </p>

        <Link href={`/products/${id}`}>
          <h3 className="mt-2 text-xl font-semibold text-slate-900 transition hover:text-yellow-700">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-3 flex items-center gap-1 text-amber-500">
          <Star size={16} fill="currentColor" />

          <span className="text-sm text-slate-700">
            {rating} ({reviews})
          </span>
        </div>

        {/* Price */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {oldPrice && (
              <span className="text-slate-400 line-through">
                €{oldPrice}
              </span>
            )}

            <span className="text-2xl font-bold text-slate-900">
              €{price}
            </span>
          </div>

          <Link
            href={`/products/${id}`}
            aria-label={`View ${name}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 transition hover:bg-slate-900 hover:text-white"
          >
            <Plus size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}