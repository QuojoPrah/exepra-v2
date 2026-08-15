"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  const totalPages = 3;

  const startIndex =
    activePage === 0
      ? 0
      : activePage === 1
      ? 1
      : 3;

  const visibleTestimonials = testimonials.slice(
    startIndex,
    startIndex + 3
  );

  return (
    <section className="bg-white py-18">
      <div className="mx-auto max-w-7xl px-8">

        {/* Heading */}
        <div className="mb-12 text-center">

          <p className="mx-auto max-w-2xl mt-4 mb-4 font-bold text-2xl leading-8 uppercase text-slate-900">
            Feedback from our <span className="text-yellow-600">valued customers.</span>
          </p>

          <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-500">
            Thousands of happy customers trust Exepra for quality products and
            exceptional service.
          </p>

        </div>

        {/* Testimonials */}
        <div className="overflow-hidden">

          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{
                duration: 0.45,
                ease: "easeOut",
              }}
              className="grid gap-7 md:grid-cols-3"
            >

              {visibleTestimonials.map((testimonial) => (
                <article
                  key={testimonial.name}
                  className="
                    rounded-[28px]
                    border
                    border-slate-200/70
                    bg-white
                    px-7
                    py-4
                    shadow-[0_12px_35px_rgba(15,23,42,0.05)]
                    md:px-8
                    md:py-7
                  "
                >

                  {/* Rating */}
                  <div className="text-sm tracking-[0.2em] text-amber-400">
                    ★★★★★
                  </div>

                  {/* Quote */}
                  <p className="mt-7 text-lg leading-8 text-slate-600">
                    “{testimonial.quote}”
                  </p>

                  {/* Customer */}
                  <div className="mt-4 items-center justify-end pt-2">

                    <div className="text-right">

                      <p className="font-semibold text-slate-900">
                        {testimonial.name}
                      </p>

                      <p className="text-sm text-slate-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                </article>
              ))}

            </motion.div>
          </AnimatePresence>

        </div>

        {/* Carousel Dots */}
        <div className="mt-10 flex items-center justify-center gap-2">

          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Show testimonial group ${index + 1}`}
              onClick={() => setActivePage(index)}
              className={`
                h-2.5
                rounded-full
                transition-all
                duration-300
                ${
                  activePage === index
                    ? "w-8 bg-slate-900"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }
              `}
            />
          ))}

        </div>

      </div>
    </section>
  );
}