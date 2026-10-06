"use client";

import CategoryCard from "@/components/product/category-card";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const categories = [
  {
    title: "Schreibtische",
    image: "/images/categories/home.jpg",
  },
  {
    title: "Mülleimer",
    image: "/images/categories/tech.jpg",
  },
  {
    title: "Rollcontainer",
    image: "/images/categories/fitness.jpg",
  },
  {
    title: "Trampoline",
    image: "/images/categories/lifestyle.jpg",
  },
  {
    title: "Schminktische",
    image: "/images/categories/fitness.jpg",
  },
  {
    title: "Kratzbäume",
    image: "/images/categories/home.jpg",
  },
  {
    title: "Kleiderständer",
    image: "/images/categories/home.jpg",
  },
  {
    title: "Nachttische",
    image: "/images/categories/tech.jpg",
  },
];

export default function Categories() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const updateSelectedIndex = useCallback(() => {
    if (!emblaApi) return;

    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    updateSelectedIndex();

    emblaApi.on("select", updateSelectedIndex);
    emblaApi.on("reInit", updateSelectedIndex);

    return () => {
      emblaApi.off("select", updateSelectedIndex);
      emblaApi.off("reInit", updateSelectedIndex);
    };
  }, [emblaApi, updateSelectedIndex]);

  /*
   * Embla calculates the number of scroll snaps based on the
   * number of cards visible at each breakpoint.
   */
  const scrollSnapCount = emblaApi?.scrollSnapList().length ?? 1;

  const progress =
    scrollSnapCount > 1
      ? (selectedIndex / (scrollSnapCount - 1)) * 100
      : 100;

  return (
    <section className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-slate-400">
            EXPLORE EXEPRA
          </p>

          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Explore our collections
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-500 md:text-lg">
            Discover thoughtfully selected products designed to elevate
            everyday living.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative mt-14 md:mt-16">
          {/* Previous */}
          <button
            type="button"
            aria-label="Previous collection"
            onClick={() => emblaApi?.scrollPrev()}
            className="group absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-[calc(50%+2px)] hover:bg-white md:left-4"
          >
            <ChevronLeft
              className="h-5 w-5 text-slate-700 transition-transform duration-300 group-hover:-translate-x-0.5"
              strokeWidth={1.7}
            />
          </button>

          {/* Viewport */}
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {categories.map((category) => (
                <div
                  key={category.title}
                  className="min-w-0 flex-[0_0_88%] px-2 sm:flex-[0_0_55%] md:flex-[0_0_40%] xl:flex-[0_0_25%]"
                >
                  <CategoryCard
                    title={category.title}
                    image={category.image}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Next */}
          <button
            type="button"
            aria-label="Next collection"
            onClick={() => emblaApi?.scrollNext()}
            className="group absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-[calc(50%+2px)] hover:bg-white md:right-4"
          >
            <ChevronRight
              className="h-5 w-5 text-slate-700 transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={1.7}
            />
          </button>

          {/* Premium Carousel Indicator */}
          <div className="mx-auto mt-10 max-w-xs px-4">
            <div className="relative h-[2px] w-full bg-slate-200">
              <div
                className="absolute top-1/2 h-[5px] w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-700 transition-[left] duration-500 ease-out"
                style={{
                  left: `${progress}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}