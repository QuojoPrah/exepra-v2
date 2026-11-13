"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { Price } from "@/components/ui/price";
import { Button } from "@/components/ui/button";
import { useCart, useUI, useWishlist } from "@/components/providers/store-providers";
import type { ProductSummary } from "@/lib/catalog";
import { FALLBACK_IMAGE } from "@/lib/site";

type Item = ProductSummary & { available: boolean; singleVariantId: string | null };

export function WishlistGrid({ items }: { items: Item[] }) {
  const router = useRouter();
  const wishlist = useWishlist();
  const cart = useCart();
  const { openQuickView, notify } = useUI();
  const [busy, setBusy] = useState<string | null>(null);

  const remove = async (id: string) => {
    setBusy(id);
    await wishlist.toggle(id, false);
    setBusy(null);
    router.refresh();
  };

  const moveToCart = async (item: Item) => {
    if (!item.singleVariantId) return openQuickView(item.slug);
    setBusy(item.id);
    const r = await cart.add(item.singleVariantId, 1);
    if (r.ok) {
      await wishlist.toggle(item.id, false);
      router.refresh();
    } else notify(r.error, "error");
    setBusy(null);
  };

  return (
    <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
      {items.map((item) => (
        <li key={item.id} className="flex flex-col">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-cream">
            <Link href={`/product/${item.slug}`} aria-label={item.name} className="absolute inset-0 block">
              <Image src={item.image ?? FALLBACK_IMAGE} alt="" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
            </Link>
            <button type="button" onClick={() => remove(item.id)} disabled={busy === item.id} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-soft hover:bg-white" aria-label={`Remove ${item.name} from wishlist`}>
              {busy === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            </button>
          </div>
          <Link href={`/product/${item.slug}`} className="mt-3 text-[0.95rem] font-medium hover:text-bronze-deep">
            {item.name}
          </Link>
          <Price price={item.price} compareAt={item.compareAtPrice} className="mt-1" />
          <Button variant={item.inStock && item.available ? "primary" : "outline"} size="sm" className="mt-3" disabled={!item.inStock || !item.available || busy === item.id} onClick={() => moveToCart(item)}>
            {!item.available ? "No longer available" : !item.inStock ? "Out of stock" : item.singleVariantId ? "Move to bag" : "Choose options"}
          </Button>
        </li>
      ))}
    </ul>
  );
}
