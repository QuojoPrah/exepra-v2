"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { FALLBACK_IMAGE } from "@/lib/site";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: { url: string; alt: string }[]; name: string }) {
  const list = images.length ? images : [{ url: FALLBACK_IMAGE, alt: name }];
  const [index, setIndex] = useState(0);
  const go = (d: number) => setIndex((i) => (i + d + list.length) % list.length);

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none lg:w-20 lg:flex-col" role="tablist" aria-label="Product images">
          {list.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Image ${i + 1} of ${list.length}`}
              onClick={() => setIndex(i)}
              className={cn("relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-lg bg-cream lg:w-full", i === index ? "ring-2 ring-ink ring-offset-2 ring-offset-ivory" : "opacity-70 hover:opacity-100")}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div
        className="relative aspect-[4/5] flex-1 overflow-hidden rounded-[var(--radius-card)] bg-cream"
        tabIndex={list.length > 1 ? 0 : -1}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        aria-label={list.length > 1 ? "Product image gallery, use arrow keys to navigate" : undefined}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div key={index} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <Image src={list[index].url} alt={list[index].alt || name} fill priority={index === 0} sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
        {list.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-soft hover:bg-white">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next image" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-soft hover:bg-white">
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
