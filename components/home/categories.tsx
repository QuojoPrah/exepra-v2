"use client";

import CarouselScrollbar from "@/components/ui/carousel-scrollbar";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CategoryCard from "@/components/product/category-card";
import useEmblaCarousel from "embla-carousel-react";

export default function Categories() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
  align: "start",
  loop: true,
  });

  const [scrollProgress, setScrollProgress] = useState(0);

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

  useEffect(() => {
  if (!emblaApi) return;

  const updateProgress = () => {
    setScrollProgress(emblaApi.scrollProgress());
  };

  updateProgress();

  emblaApi.on("scroll", updateProgress);
  emblaApi.on("reInit", updateProgress);

  return () => {
    emblaApi.off("scroll", updateProgress);
    emblaApi.off("reInit", updateProgress);
  };
  }, [emblaApi]);


  return (
    <section className="bg-white pt-16 pb-20">
      <div className="mx-auto max-w-7xl px-6">

        <h2 className="mx-auto mt-4 max-w-3xl text-center text-5xl font-bold text-slate-700">
          Explore our trending collections
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-center text-lg text-slate-500">
          Discover premium products designed to elevate your everyday living.
        </p>

        <div className="relative mt-16">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-5 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/40 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-white/80"
            >
            <ChevronLeft className="h-6 w-6 text-slate-800" />
          </button>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {categories.map((category) => (
                <div
                  key={category.title}
                  className="min-w-0 flex-[0_0_100%] px-3 sm:flex-[0_0_50%] xl:flex-[0_0_25%]"
                  >
                  <CategoryCard
                    title={category.title}
                    image={category.image}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-5 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/40 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-white/80"
            >
            <ChevronRight className="h-6 w-6 text-slate-800" />
          </button>

          <CarouselScrollbar emblaApi={emblaApi} />

        </div>

        

      </div>
    </section>
  );
}