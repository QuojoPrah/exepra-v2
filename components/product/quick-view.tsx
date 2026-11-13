"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Stars } from "@/components/ui/stars";
import { PurchasePanel, type PurchaseVariant } from "@/components/product/purchase-panel";
import { useUI } from "@/components/providers/store-providers";
import { FALLBACK_IMAGE } from "@/lib/site";
import { cn } from "@/lib/utils";

type QuickViewProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string | null;
  images: { url: string; alt: string }[];
  variants: PurchaseVariant[];
  rating: { average: number; count: number } | null;
};

export function QuickView() {
  const { quickViewSlug, closeQuickView } = useUI();
  return (
    <Modal open={Boolean(quickViewSlug)} onClose={closeQuickView} title="Quick view" hideTitle>
      {quickViewSlug && <QuickViewContent key={quickViewSlug} slug={quickViewSlug} onClose={closeQuickView} />}
    </Modal>
  );
}

function QuickViewContent({ slug, onClose: closeQuickView }: { slug: string; onClose: () => void }) {
  const [product, setProduct] = useState<QuickViewProduct | null>(null);
  const [error, setError] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/products/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setProduct)
      .catch((e) => e?.name !== "AbortError" && setError(true));
    return () => controller.abort();
  }, [slug]);

  return (
    <>
      {error ? (
        <p className="px-6 pb-10 text-center text-sm text-danger">This product couldn&apos;t be loaded. Please try again.</p>
      ) : !product ? (
        <div className="flex h-80 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted" aria-label="Loading" />
        </div>
      ) : (
        <div className="grid gap-6 px-5 pb-6 sm:px-6 md:grid-cols-2 md:gap-8">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-cream">
              <Image src={product.images[imageIndex]?.url ?? FALLBACK_IMAGE} alt={product.images[imageIndex]?.alt ?? product.name} fill sizes="(max-width: 768px) 90vw, 420px" className="object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none">
                {product.images.map((img, i) => (
                  <button key={img.url} type="button" onClick={() => setImageIndex(i)} aria-label={`Show image ${i + 1}`} aria-pressed={i === imageIndex} className={cn("relative h-16 w-13 shrink-0 overflow-hidden rounded-lg", i === imageIndex ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100")}>
                    <Image src={img.url} alt="" fill sizes="52px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            {product.category && <p className="eyebrow">{product.category}</p>}
            <h3 className="mt-2 text-2xl font-semibold leading-tight">{product.name}</h3>
            {product.rating && (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                <Stars rating={product.rating.average} /> {product.rating.average} ({product.rating.count})
              </p>
            )}
            <p className="mt-4 line-clamp-4 text-sm leading-6 text-ink-soft">{product.description}</p>
            <div className="mt-6">
              <PurchasePanel productId={product.id} basePrice={product.price} compareAtPrice={product.compareAtPrice} variants={product.variants} compact onAdded={closeQuickView} />
            </div>
            <Link href={`/product/${product.slug}`} onClick={closeQuickView} className="mt-6 text-sm font-medium text-bronze-deep underline-offset-4 hover:underline">
              View full details →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
