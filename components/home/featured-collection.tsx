import ProductPreview from "@/components/home/product-preview";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function FeaturedCollection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="relative h-[580px] overflow-hidden rounded-[36px]">

        <Image
          src="/images/cozyliving3.jpg"
          alt="Summer Collection"
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

        <div className="absolute inset-0 flex items-center">

        <div className="max-w-xl pl-16 pt-10">

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          NEW IN
        </p>

        <h2 className="mt-4 text-5xl lg:text-6xl font-bold leading-tight text-white">
          Summer
          <br />
          Essentials
        </h2>

        <p className="mt-6 text-lg text-white/80">
          Discover beautifully curated collections designed
          for every part of your lifestyle.
        </p>

        <button className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl group">

          <span>Explore Collection</span>

          <ArrowRight
            size={18}
            strokeWidth={2}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </button>
      </div>

      </div>

      </div>

      </div>
    </section>
  );
}