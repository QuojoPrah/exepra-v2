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

// Duplicate the array for a seamless loop
const logos = [...featuredIn, ...featuredIn];

export default function FeaturedIn() {
  return (
    <section className="overflow-hidden bg-white py-24">

      <div className="mb-10 text-center">
        <p className="text-sm font-semibold tracking-[0.4em] uppercase text-slate-500">
          INSPIRED BY
        </p>
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-40 bg-gradient-to-r from-white to-transparent" />
        <motion.div
          className="flex w-max gap-32"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {logos.map((logo, index) => (
            <div
              key={index}
              className="relative flex h-14 w-56 items-center justify-center flex-shrink-0 opacity-60 transition-opacity duration-500"
            >
              <Image
                src={logo.image}
                alt={logo.name}
                fill
                draggable={false}
                className="object-contain scale-150"
              />
            </div>
          ))}
        </motion.div>
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-40 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
}