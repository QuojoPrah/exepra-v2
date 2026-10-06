"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "Amazing quality. Everything arrived beautifully packaged and even better than expected.",
    name: "Sarah M.",
    role: "Customer",
  },
  {
    quote:
      "Exepra has become my favourite place to shop online. Premium products and fast delivery.",
    name: "Daniel K.",
    role: "Customer",
  },
  {
    quote:
      "Beautiful website, beautiful products and outstanding customer service.",
    name: "Festus M.",
    role: "Customer",
  },
  {
    quote:
      "The quality exceeded my expectations. You can immediately tell that Exepra pays attention to detail.",
    name: "Michael R.",
    role: "Customer",
  },
  {
    quote:
      "From ordering to delivery, the entire experience felt effortless and premium.",
    name: "Olivia T.",
    role: "Customer",
  },
  {
    quote:
      "I've already recommended Exepra to my friends. Great products and an excellent shopping experience.",
    name: "James A.",
    role: "Customer",
  },
  {
    quote:
      "Everything felt carefully considered, from the product selection to the packaging. Excellent experience.",
    name: "Sophia B.",
    role: "Customer",
  },
  {
    quote:
      "A genuinely enjoyable shopping experience. The product quality and service were both exceptional.",
    name: "Alexander P.",
    role: "Customer",
  },
  {
    quote:
      "Exepra delivers exactly what you hope for from a premium online store. I will definitely shop again.",
    name: "Mia R.",
    role: "Customer",
  },
];

export default function Testimonials() {
  const [activePage, setActivePage] = useState(0);

  const totalPages = Math.ceil(testimonials.length / 3);
  const startIndex = activePage * 3;

  const visibleTestimonials = testimonials.slice(
    startIndex,
    startIndex + 3
  );

  const indicatorPosition =
    totalPages > 1 ? (activePage / (totalPages - 1)) * 100 : 0;

  return (
    <section className="bg-white py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-slate-400">
            CUSTOMER STORIES
          </p>

          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Loved by people
            <br />
            who shop thoughtfully.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-500 md:text-lg">
            Discover what customers are saying about their Exepra experience.
          </p>
        </div>

        {/* Testimonials */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
              }}
              className="grid gap-7 md:grid-cols-3"
            >
              {visibleTestimonials.map((testimonial) => (
                <article
                  key={testimonial.name}
                  className="group flex min-h-[330px] flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white px-7 py-8 shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.09)] md:px-8"
                >
                  {/* Rating */}
                  <div
                    className="text-[13px] tracking-[0.2em] text-amber-400"
                    aria-label="5 out of 5 stars"
                  >
                    ★★★★★
                  </div>

                  {/* Quote */}
                  <p className="mt-7 flex-1 text-[17px] leading-8 text-slate-600">
                    “{testimonial.quote}”
                  </p>

                  {/* Customer */}
                  <div className="mt-8 border-t border-slate-100 pt-5">
                    <p className="text-sm font-semibold text-slate-900">
                      {testimonial.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {testimonial.role}
                    </p>
                  </div>
                </article>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Moving Carousel Indicator */}
        {totalPages > 1 && (
          <div className="mx-auto mt-12 max-w-xs">
            <div className="relative h-[2px] w-full bg-slate-200">
              <motion.div
                className="absolute top-1/2 h-[5px] w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-700"
                animate={{
                  left: `${indicatorPosition}%`,
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                }}
              />

              {/* Clickable Areas */}
              <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Show testimonial group ${index + 1}`}
                    onClick={() => setActivePage(index)}
                    className="h-8 flex-1 cursor-pointer"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}