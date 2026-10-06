"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    image: "/images/hero/hero1.jpg",
    title: "Elevate the Way\nYou Live.",
    subtitle:
      "Selected products that combine style, innovation and everyday practicality.",
    primaryLink: "/products",
    secondaryLink: "/collections",
  },
  {
    image: "/images/hero/hero2.jpg",
    title: "Technology\nMade Beautiful.",
    subtitle: "Premium gadgets designed for modern lifestyles.",
    primaryLink: "/products?category=tech",
    secondaryLink: "/collections/tech",
  },
  {
    image: "/images/hero/hero3.jpg",
    title: "Move Better.\nFeel Better.",
    subtitle:
      "Fitness essentials that inspire your everyday performance.",
    primaryLink: "/products?category=fitness",
    secondaryLink: "/collections/fitness",
  },
  {
    image: "/images/hero/hero4.jpg",
    title: "Curated For\nEveryday Living.",
    subtitle:
      "Everything you need\nfor a smarter,\nmore beautiful home.",
    primaryLink: "/products?category=home",
    secondaryLink: "/collections/home",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative min-h-screen overflow-hidden pt-40 pb-32">
      {/* Background Image */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={current}
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{
            duration: 1.4,
            ease: "easeInOut",
          }}
        >
          <Image
            src={slide.image}
            alt={slide.title.replace("\n", " ")}
            fill
            priority={current === 0}
            sizes="100vw"
            className="object-cover"
          />

          {/* Cinematic Overlay */}
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
      </AnimatePresence>

      {/* Ambient Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-[180px]" />
      </div>

      <div className="relative z-20 mx-auto max-w-7xl px-6 text-center">
        {/* ================================================== */}
        {/* ANIMATED CONTENT ONLY */}
        {/* ================================================== */}

        <div className="flex h-[400px] flex-col items-center justify-center pt-8">
          {/* Eyebrow */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`eyebrow-${current}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="mb-8 text-sm font-semibold uppercase tracking-[0.4em] text-white/80"
            >
              THE EXEPRA EDIT — NEW SEASON
            </motion.p>
          </AnimatePresence>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${current}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
              className="mx-auto max-w-4xl text-6xl font-semibold leading-[1.05] tracking-tight text-white drop-shadow-2xl md:text-7xl lg:text-8xl"
            >
              {slide.title.split("\n").map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))}
            </motion.h1>
          </AnimatePresence>

          {/* Subtitle */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`subtitle-${current}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.7,
                ease: "easeOut",
              }}
              className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl"
            >
              {slide.subtitle.split("\n").map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* ================================================== */}
        {/* FIXED CTA AREA */}
        {/* ================================================== */}

        <div className="mt-4 flex h-[70px] items-center justify-center">
          <div className="flex items-center justify-center gap-4">
            {/* Shop Now */}
            <Link
              href={slide.primaryLink}
              className="group inline-flex h-14 min-w-[155px] items-center justify-center gap-3 rounded-full bg-white px-7 text-[15px] font-semibold text-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(255,255,255,0.25)]"
            >
              <span>Shop Now</span>

              <span
                aria-hidden="true"
                className="flex items-center transition-transform duration-300 group-hover:translate-x-1"
              >
                <svg
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L6 6L1 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>

            {/* Explore Collections */}
            <Link
              href={slide.secondaryLink}
              className="inline-flex h-14 min-w-[200px] items-center justify-center rounded-full border border-white/70 bg-black/20 px-7 text-[15px] font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white hover:bg-white hover:text-slate-900"
            >
              Explore Collections
            </Link>
          </div>
        </div>

        {/* ================================================== */}
        {/* FIXED SLIDE INDICATORS */}
        {/* ================================================== */}

        <div className="mt-8 flex h-6 items-center justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setCurrent(index)}
              className="group flex h-6 items-center"
            >
              <span
                className={`block h-1 rounded-full transition-all duration-500 ${
                  index === current
                    ? "w-10 bg-white"
                    : "w-5 bg-white/40 group-hover:bg-white/70"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}