"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export function AnnouncementBar({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (messages.length < 2 || paused) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % messages.length), 5000);
    return () => window.clearInterval(t);
  }, [messages.length, paused]);

  if (!messages.length) return null;
  const go = (d: number) => setIndex((i) => (i + d + messages.length) % messages.length);

  return (
    <div
      className="relative z-[60] bg-ink text-white"
      role="region"
      aria-label="Store announcements"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="container-page flex h-9 items-center justify-center gap-3">
        {messages.length > 1 && (
          <button type="button" onClick={() => go(-1)} aria-label="Previous announcement" className="hidden h-7 w-7 items-center justify-center rounded-full text-white/60 hover:text-white sm:flex">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="relative h-5 min-w-0 flex-1 overflow-hidden text-center sm:max-w-xl" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={index}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="truncate text-[0.72rem] font-medium tracking-[0.08em] sm:text-xs"
            >
              {messages[index]}
            </motion.p>
          </AnimatePresence>
        </div>
        {messages.length > 1 && (
          <button type="button" onClick={() => go(1)} aria-label="Next announcement" className="hidden h-7 w-7 items-center justify-center rounded-full text-white/60 hover:text-white sm:flex">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
