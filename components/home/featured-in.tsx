"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const featuredIn = [
  { name: "Bonmarché", image: "/images/logos/Bonmarché.svg" },
  { name: "Caltech", image: "/images/logos/Caltech.svg" },
  { name: "ModCloth", image: "/images/logos/ModCloth.svg" },
  { name: "TechCrunch", image: "/images/logos/techcrunch.svg" },
  { name: "Ripple", image: "/images/logos/Ripple.svg" },
  { name: "Amazon", image: "/images/logos/Amazon.svg" },
  { name: "Olivetti", image: "/images/logos/Olivetti.svg" },
];

const logos = [...featuredIn, ...featuredIn];

export default function FeaturedIn() {
  return (
    <section className="overflow-hidden border-b border-slate-100 bg-white py-20 md:py-24">
      {/* Section Heading */}
      <div className="mb-12 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-slate-400">
          INSPIRED BY
        </p>
      </div>

      {/* Logo Marquee */}
      <div className="relative overflow-hidden">
        {/* Left Fade */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-white via-white/90 to-transparent md:w-48" />

        <motion.div
          className="flex w-max items-center gap-20 md:gap-28"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {logos.map((logo, index) => (
            <div
              key={`${logo.name}-${index}`}
              className="relative flex h-12 w-44 flex-shrink-0 items-center justify-center opacity-45 transition-opacity duration-500 hover:opacity-80 md:h-14 md:w-52"
            >
              <Image
                src={logo.image}
                alt={logo.name}
                fill
                draggable={false}
                sizes="208px"
                className="object-contain"
              />
            </div>
          ))}
        </motion.div>

        {/* Right Fade */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-white via-white/90 to-transparent md:w-48" />
      </div>
    </section>
  );
}