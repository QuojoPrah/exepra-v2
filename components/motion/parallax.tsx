"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps an image (or anything) so it drifts slower than the page while scrolling,
 * giving a sense of depth. The child is over-scaled so no edges ever show.
 */
export function Parallax({ children, className, strength = 10 }: { children: React.ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);
  return (
    <div ref={ref} className={cn("absolute inset-0 overflow-hidden", className)}>
      <motion.div className="absolute -inset-y-[14%] inset-x-0 will-change-transform" style={reduce ? undefined : { y }}>
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Reveals its content with a curtain wipe (clip-path) when scrolled into view.
 * The in-view check runs on an unclipped wrapper: browsers treat a fully clipped
 * element as invisible, so it would never trigger on itself.
 */
export function ClipReveal({ children, className, from = "bottom" }: { children: React.ReactNode; className?: string; from?: "bottom" | "left" }) {
  const reduce = useReducedMotion();
  const hidden = from === "bottom" ? "inset(100% 0% 0% 0%)" : "inset(0% 100% 0% 0%)";
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
      <motion.div
        className={className}
        variants={{ hidden: { clipPath: hidden }, visible: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.3, ease: [0.76, 0, 0.24, 1] } } }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
