"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

let lenis: Lenis | null = null;

/**
 * Weighted, buttery scrolling on desktop (mouse / trackpad). Touch devices keep
 * native scrolling, and it is off entirely for visitors who prefer reduced motion.
 * Pauses automatically while a dialog locks the page (body overflow hidden).
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (reduce || !finePointer) return;

    lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      anchors: { offset: -96 },
      autoRaf: true,
      // Let scrollable dialogs, drawers and dropdowns scroll natively.
      prevent: (node) => Boolean(node.closest?.("[role=dialog], [data-lenis-prevent]")),
    });

    // Stop while a modal has locked the page, resume afterwards.
    const sync = () => (document.body.style.overflow === "hidden" ? lenis?.stop() : lenis?.start());
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });

    return () => {
      observer.disconnect();
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  // Start every new page at the top without a long smooth glide.
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
