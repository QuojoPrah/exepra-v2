"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Children, Fragment, createElement } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const TEXT_TAGS = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p } as const;
type TextTag = keyof typeof TEXT_TAGS;

/** Fades and lifts its content in when it scrolls into view (once). */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "p" | "span";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  if (reduce) return createElement(as, { className }, children);
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/**
 * Headline that rises in word by word from behind a mask.
 * Screen readers get the full text once via aria-label.
 */
export function RevealText({
  text,
  as = "h2",
  className,
  delay = 0,
  stagger = 0.06,
  onView = true,
  id,
}: {
  text: string;
  as?: TextTag;
  className?: string;
  delay?: number;
  stagger?: number;
  /** true: animate when scrolled into view; false: animate on mount (e.g. hero). */
  onView?: boolean;
  id?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return createElement(as, { className, id }, text);

  const lines = text.split("\n");
  let wordIndex = 0;
  const word: Variants = {
    hidden: { y: "110%", rotate: 2 },
    visible: (i: number) => ({ y: "0%", rotate: 0, transition: { duration: 0.9, ease: EASE, delay: delay + i * stagger } }),
  };
  const trigger = onView
    ? { initial: "hidden", whileInView: "visible", viewport: { once: true, amount: 0.5 } }
    : { initial: "hidden", animate: "visible" };

  const MotionTag = TEXT_TAGS[as];
  return (
    <MotionTag className={className} id={id} aria-label={text.replace(/\n/g, " ")} {...trigger}>
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden>
          {line.split(" ").map((w, wi, words) => {
            const i = wordIndex++;
            return (
              <Fragment key={wi}>
                <span className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-top">
                  <motion.span className="inline-block will-change-transform" custom={i} variants={word}>
                    {w}
                  </motion.span>
                </span>
                {/* The space must sit outside the inline-block, or the browser drops it. */}
                {wi < words.length - 1 ? " " : null}
              </Fragment>
            );
          })}
        </span>
      ))}
    </MotionTag>
  );
}

/** A list whose items fade up one after another when the list scrolls into view. */
export function Stagger({
  children,
  className,
  itemClassName,
  stagger = 0.08,
  as = "ul",
}: {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  stagger?: number;
  as?: "ul" | "ol" | "div";
}) {
  const reduce = useReducedMotion();
  const items = Children.toArray(children);
  const ItemTag = as === "div" ? "div" : "li";
  if (reduce) {
    return createElement(as, { className }, items.map((child, i) => createElement(ItemTag, { key: i, className: itemClassName }, child)));
  }
  const List = motion[as];
  const Item = motion[ItemTag];
  return (
    <List
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1, margin: "0px 0px -40px 0px" }}
      variants={{ visible: { transition: { staggerChildren: stagger } } }}
    >
      {items.map((child, i) => (
        <Item
          key={i}
          className={cn(itemClassName)}
          variants={{ hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } } }}
        >
          {child}
        </Item>
      ))}
    </List>
  );
}
