"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { RevealText } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/interactive";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type HeroSlideData = {
  id: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  image: string;
  imageAlt: string;
  primaryLabel: string | null;
  primaryHref: string | null;
  secondaryLabel: string | null;
  secondaryHref: string | null;
};

const INTERVAL = 6000;

export default function Hero({ slides }: { slides: HeroSlideData[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const reduceMotion = useReducedMotion();
  const count = slides.length;

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused || userPaused || reduceMotion) return;
    const t = window.setTimeout(() => go(1), INTERVAL);
    return () => window.clearTimeout(t);
  }, [index, count, paused, userPaused, reduceMotion, go]);

  const slide = slides[index];

  // Scroll-linked depth: the image sinks and zooms, the text drifts up and fades.
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[640px] items-end overflow-hidden bg-ink text-white h-[92svh] max-h-[960px]"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <motion.div className="absolute inset-0 -z-10 will-change-transform" style={reduceMotion ? undefined : { y: imageY, scale: imageScale }}>
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.id + index}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.1, ease: "easeInOut" }, scale: { duration: 7, ease: "linear" } }}
        >
          {!broken.has(slide.image) && (
            <Image
              src={slide.image}
              alt={slide.imageAlt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-center"
              onError={() => setBroken((b) => new Set(b).add(slide.image))}
            />
          )}
        </motion.div>
      </AnimatePresence>
      </motion.div>
      {/* Readability overlays */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/25 to-black/20" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/45 via-black/10 to-transparent" aria-hidden />

      <div className="container-page relative pb-24 pt-40 sm:pb-28 lg:pb-32">
        <motion.div style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slide.id + index}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
          >
            {slide.eyebrow && (
              <motion.p initial={{ opacity: 0, letterSpacing: "0.5em" }} animate={{ opacity: 1, letterSpacing: "0.32em" }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} className="mb-5 text-xs font-semibold uppercase tracking-[0.32em] text-white/80">
                {slide.eyebrow}
              </motion.p>
            )}
            <RevealText as="h1" text={slide.title} onView={false} delay={0.1} stagger={0.08} className="text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.03em] [text-wrap:balance] sm:text-6xl lg:text-7xl" />
            {slide.subtitle && (
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }} className="mt-5 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
                {slide.subtitle}
              </motion.p>
            )}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }} className="mt-9 flex flex-wrap gap-3">
              {slide.primaryHref && slide.primaryLabel && (
                <Magnetic>
                  <Link href={slide.primaryHref} className={buttonClasses("light", "lg", "h-13")}>
                    {slide.primaryLabel}
                  </Link>
                </Magnetic>
              )}
              {slide.secondaryHref && slide.secondaryLabel && (
                <Magnetic>
                  <Link href={slide.secondaryHref} className={cn(buttonClasses("ghost", "lg", "h-13"), "border border-white/60 text-white hover:bg-white/10")}>
                    {slide.secondaryLabel}
                  </Link>
                </Magnetic>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
        </motion.div>

        {count > 1 && (
          <div className="absolute bottom-8 left-4 right-4 flex items-center justify-between gap-4 sm:left-6 sm:right-6 lg:left-10 lg:right-10">
            <div className="flex items-center gap-2">
              {slides.map((s, i) => (
                <button key={s.id} type="button" onClick={() => setIndex(i)} aria-label={`Go to slide ${i + 1}`} aria-current={i === index} className="group flex h-8 items-center">
                  <span className="relative h-[2px] w-10 overflow-hidden rounded-full bg-white/30 sm:w-14">
                    {i === index && (
                      <motion.span
                        key={`${index}-${paused || userPaused}`}
                        className="absolute inset-y-0 left-0 bg-white"
                        initial={{ width: paused || userPaused || reduceMotion ? "100%" : "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: paused || userPaused || reduceMotion ? 0 : INTERVAL / 1000, ease: "linear" }}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setUserPaused((p) => !p)} aria-label={userPaused ? "Play slideshow" : "Pause slideshow"} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 hover:bg-white/10">
                {userPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
              <button type="button" onClick={() => go(-1)} aria-label="Previous slide" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 hover:bg-white/10">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next slide" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 hover:bg-white/10">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
