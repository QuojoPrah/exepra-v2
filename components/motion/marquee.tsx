"use client";

import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity, wrap } from "framer-motion";
import { useRef } from "react";

/**
 * Endless ticker strip. Drifts slowly on its own; scrolling the page speeds it up
 * and reverses its direction with the scroll, which makes the page feel alive.
 */
export function Marquee({ items, baseSpeed = 2.2 }: { items: string[]; baseSpeed?: number }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [0, 1000], [0, 4], { clamp: false });
  const direction = useRef(-1);
  const pos = useTransform(x, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const f = factor.get();
    if (f < 0) direction.current = 1;
    else if (f > 0) direction.current = -1;
    x.set(x.get() + direction.current * baseSpeed * (delta / 1000) * (1 + Math.abs(f)));
  });

  const row = (
    <span className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6 font-display text-2xl font-medium tracking-[-0.02em] sm:px-10 sm:text-4xl">{t}</span>
          <span className="text-bronze" aria-hidden>
            ✦
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div className="overflow-hidden border-y border-line bg-ivory py-6 sm:py-8" aria-label={items.join(" · ")} role="marquee">
      <motion.div className="flex w-max whitespace-nowrap text-ink will-change-transform" style={reduce ? undefined : { x: pos }} aria-hidden>
        {row}
        {row}
        {row}
        {row}
      </motion.div>
    </div>
  );
}
