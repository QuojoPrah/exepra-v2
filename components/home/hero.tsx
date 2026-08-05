"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

const slides = [
{
image: "/images/hero/hero1.jpg",
title: "Elevate the Way\nYou Live.",
subtitle: "Selected products that combine style, innovation and everyday practicality.",
},
{
image: "/images/hero/hero2.jpg",
title: "Technology\nMade Beautiful.",
subtitle: "Premium gadgets designed for modern lifestyles.",
},
{
image: "/images/hero/hero3.jpg",
title: "Move Better.\nFeel Better.",
subtitle: "Fitness essentials that inspire your everyday performance.",
},
{
image: "/images/hero/hero4.jpg",
title: "Curated For Everyday Living.",
subtitle: "Everything you need\nfor a smarter,\nmore beautiful home.",
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



  return (
    <section className="relative  min-h-screen overflow-hidden pt-40 pb-32">

        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={current}
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          >
            <Image
              src={slides[current].image}
              alt={slides[current].title}
              fill
              priority
              className="object-cover"
            />

            <div className="absolute inset-0 bg-black/50" />
          </motion.div>
        </AnimatePresence>


      {/* Blue Glow */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-[180px]" />
      </div>

      <div className="relative z-20 mx-auto max-w-7xl px-6 text-center">

        <div className="min-h-[340px] flex flex-col justify-center pt-16">

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .6 }}
            className="mb-8 tracking-[0.4em] text-sm font-semibold uppercase text-white/80"
          >
            THE EXEPRA EDIT — NEW SEASON
          </motion.p>

          <AnimatePresence mode="wait">
            <motion.h1
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
              className="mx-auto max-w-4xl text-7xl font-black leading-tight text-white drop-shadow-2xl md:text-8xl"
              >
              {slides[current].title.split("\n").map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </motion.h1>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7 }}
              className="mx-auto mt-8 max-w-2xl text-xl text-white/90"
            >
              {slides[current].subtitle.split("\n").map((line, index) => (
                <span key={index}>{line}</span>
              ))}
            </motion.p>
          </AnimatePresence>
        </div>

        

        <div className="mt-12 flex justify-center gap-5">
          <motion.button
            whileHover={{
            scale: 1.05,
            y: -3,
            }}
            whileTap={{
            scale: 0.97,
            }}
            transition={{
            type: "spring",
            stiffness: 350,
            damping: 20,
            }}
            className="group relative overflow-hidden rounded-full bg-white px-8 py-4 font-semibold text-slate-900 shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(255, 255, 255, 0.35)]"
            >
            <span
              className="
              absolute
              inset-y-0
              -left-20
              w-16
              rotate-12
              bg-white/70
              blur-md
              transition-all
              duration-700
              group-hover:left-[130%]
              "
            />
              
            Shop Now →
          </motion.button>

          <motion.button
            whileHover={{
            scale: 1.05,
            y: -3,
            }}
            whileTap={{
            scale: 0.97,
            }}
            transition={{
            type: "spring",
            stiffness: 350,
            damping: 20,
            }}
            className="group relative overflow-hidden rounded-full border border-white bg-white/10 px-6 py-4 font-semibold text-white backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white hover:text-slate-900 hover:shadow-[0_20px_50px_rgba(255, 255, 255, 0.25)]"
            >
            <span
              className="
              absolute
              inset-y-0
              -left-20
              w-16
              rotate-12
              bg-white/70
              blur-md
              transition-all
              duration-700
              group-hover:left-[130%]
              "
            />
            Explore Collections
          </motion.button>
        </div>
      </div>

      {/* Floating badges */}

      {/*
      <motion.div
        className="absolute left-20 top-64 rounded-full bg-white/15 border border-white/20 px-6 py-3 backdrop-blur-2xl shadow-2xl text-white text-sm font-medium"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        >
        🚚 Free shipping over $75
      </motion.div>

      <motion.div
        className="absolute right-20 top-52 rounded-full bg-white/15 border border-white/20 px-6 py-3 backdrop-blur-2xl shadow-2xl text-white text-sm font-medium"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        >
        🔒 Secure checkout
      </motion.div>

      <motion.div
        className="absolute right-24 bottom-32 rounded-full bg-white/15 border border-white/20 px-6 py-3 backdrop-blur-2xl shadow-2xl text-white text-sm font-medium"
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        >
        ⭐ 4.9 average rating
      </motion.div>
      */}

    </section>
  );
}