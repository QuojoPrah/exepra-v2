import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { WishlistGrid } from "@/components/product/wishlist-grid";
import { getWishlistProducts } from "@/lib/wishlist";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const [items, session] = await Promise.all([getWishlistProducts(), getSession()]);
  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="text-3xl font-semibold sm:text-4xl">Wishlist</h1>
      {!session && items.length > 0 && (
        <p className="mt-2 text-sm text-muted">Saved on this device. Sign in to keep your wishlist across devices — it&apos;ll be merged automatically.</p>
      )}
      {items.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-cream">
            <Heart className="h-8 w-8 text-bronze-deep" aria-hidden />
          </span>
          <h2 className="mt-6 text-xl font-semibold">Nothing saved yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted">Tap the heart on any product to save it here for later.</p>
          <LinkButton href="/shop" className="mt-8">
            Discover products
          </LinkButton>
        </div>
      ) : (
        <WishlistGrid items={items} />
      )}
    </div>
  );
}
