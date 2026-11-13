"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { Price } from "@/components/ui/price";
import { Stars } from "@/components/ui/stars";
import { useCart, useUI, useWishlist } from "@/components/providers/store-providers";
import type { ProductSummary } from "@/lib/catalog";
import { discountPercent } from "@/lib/money";
import { FALLBACK_IMAGE } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function ProductCard({ product, priority = false }: { product: ProductSummary; priority?: boolean }) {
  const wishlist = useWishlist();
  const cart = useCart();
  const { openQuickView, notify } = useUI();
  const [adding, setAdding] = useState(false);
  const saved = wishlist.has(product.id);
  const pct = discountPercent(product.price, product.compareAtPrice);
  const href = `/product/${product.slug}`;

  const quickAdd = async () => {
    if (!product.quickAddVariantId) return openQuickView(product.slug);
    setAdding(true);
    const r = await cart.add(product.quickAddVariantId, 1);
    setAdding(false);
    if (!r.ok) notify(r.error, "error");
  };

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-cream">
        <Link href={href} tabIndex={-1} aria-hidden className="absolute inset-0">
          <Image
            src={product.image ?? FALLBACK_IMAGE}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn("object-cover transition duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]", product.hoverImage && "group-hover:opacity-0")}
          />
          {product.hoverImage && (
            <Image src={product.hoverImage} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover opacity-0 transition duration-700 group-hover:opacity-100" />
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {pct ? <span className="rounded-full bg-danger px-2.5 py-1 text-[11px] font-semibold text-white">−{pct}%</span> : null}
          {product.badge && <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink">{product.badge}</span>}
          {!product.inStock && <span className="rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-medium text-white">Sold out</span>}
        </div>

        <button
          type="button"
          onClick={async () => {
            const r = await wishlist.toggle(product.id);
            if (!r.ok) notify(r.error, "error");
          }}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-soft transition hover:scale-105",
            saved ? "text-danger" : "text-ink",
          )}
        >
          <Heart className="h-[17px] w-[17px]" fill={saved ? "currentColor" : "none"} strokeWidth={1.8} />
        </button>

        <div className="absolute inset-x-3 bottom-3 flex gap-2 transition duration-300 lg:translate-y-2 lg:opacity-0 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => openQuickView(product.slug)}
            className="hidden h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/95 text-xs font-medium text-ink shadow-soft backdrop-blur transition hover:bg-white sm:flex"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye className="h-4 w-4" aria-hidden /> Quick view
          </button>
          <button
            type="button"
            onClick={quickAdd}
            disabled={!product.inStock || adding}
            className="ml-auto flex h-10 items-center justify-center gap-1.5 rounded-full bg-ink px-4 text-xs font-medium text-white shadow-soft transition hover:bg-ink-soft disabled:bg-ink/50 sm:flex-1"
            aria-label={product.quickAddVariantId ? `Add ${product.name} to bag` : `Choose options for ${product.name}`}
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" aria-hidden />}
            <span className="hidden sm:inline">{product.quickAddVariantId ? "Add to bag" : "Choose options"}</span>
          </button>
        </div>
      </div>

      <div className="mt-3.5 flex flex-1 flex-col px-0.5">
        {product.category && <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{product.category}</p>}
        <h3 className="mt-1 font-sans text-[0.95rem] font-medium leading-snug tracking-normal">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus:outline-none sm:after:hidden hover:text-bronze-deep">
            {product.name}
          </Link>
        </h3>
        {product.rating && product.rating.count > 0 && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
            <Stars rating={product.rating.average} size={12} />
            <span>({product.rating.count})</span>
          </p>
        )}
        <Price price={product.price} compareAt={product.compareAtPrice} className="mt-1.5" />
        {product.colors.length > 1 && (
          <div className="mt-2 flex items-center gap-1.5" aria-label={`${product.colors.length} colours available`}>
            {product.colors.slice(0, 5).map((c) => (
              <span key={c.name} title={c.name} className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: c.hex ?? "#e9e1d5" }} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
