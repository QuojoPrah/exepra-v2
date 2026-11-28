"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";

// Number of client-side navigations so far. The first render (server + hydration)
// is never animated, so content is visible immediately and search engines see it.
let navigations = 0;

/** Soft fade-and-rise between pages. */
export default function StoreTemplate({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const animate = navigations > 0 && !reduce;
  useEffect(() => {
    navigations++;
  }, []);
  return (
    <motion.div initial={animate ? { opacity: 0, y: 14 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
