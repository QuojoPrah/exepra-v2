"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import type { ProductSummary } from "@/lib/catalog";
import { FALLBACK_IMAGE } from "@/lib/site";

type Collection = { id: string; slug: string; name: string; description: string | null; image: string | null; products: ProductSummary[] };

export default function FeaturedCollections({ collections }: { collections: Collection[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  if (!collections.length) return null;
  const c = collections[index];
  const go = (d: number) => {
    setDirection(d);
    setIndex((i) => (i + d + collections.length) % collections.length);
  };

  return (
    <section className="bg-cream py-20 sm:py-28" aria-roledescription="carousel" aria-labelledby="collection-heading">
      <div className="container-page">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-3">Featured collection</p>
            <h2 id="collection-heading" className="text-3xl font-semibold sm:text-4xl">
              Curated edits
            </h2>
          </div>
          {collections.length > 1 && (
            <div className="flex gap-2">
              <button type="button" onClick={() => go(-1)} aria-label="Previous collection" className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white hover:border-ink/40">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next collection" className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white hover:border-ink/40">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={c.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${collections.length}: ${c.name}`}
          >
            <Link href={`/collections/${c.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-sand lg:aspect-auto lg:min-h-[520px]">
              <Image src={c.image ?? FALLBACK_IMAGE} alt="" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover transition duration-[1200ms] group-hover:scale-[1.03]" />
            </Link>
            <div className="flex flex-col justify-center">
              <h3 className="text-3xl font-semibold sm:text-4xl">{c.name}</h3>
              {c.description && <p className="mt-4 max-w-md leading-relaxed text-muted">{c.description}</p>}
              {c.products.length > 0 && (
                <ul className="mt-8 grid grid-cols-2 gap-4">
                  {c.products.slice(0, 4).map((p) => (
                    <li key={p.id}>
                      <Link href={`/product/${p.slug}`} className="group flex items-center gap-3 rounded-xl bg-white p-2.5 transition hover:shadow-soft">
                        <span className="relative h-16 w-13 shrink-0 overflow-hidden rounded-lg bg-cream">
                          <Image src={p.image ?? FALLBACK_IMAGE} alt="" fill sizes="52px" className="object-cover" />
                        </span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-xs font-medium leading-snug group-hover:text-bronze-deep">{p.name}</span>
                          <Price price={p.price} compareAt={p.compareAtPrice} size="sm" className="mt-1" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link href={`/collections/${c.slug}`} className={buttonClasses("primary", "lg", "mt-9 h-12 self-start")}>
                Explore collection
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
