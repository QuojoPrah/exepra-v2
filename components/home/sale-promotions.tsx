"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

function formatCountdown(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

const promotions = [
  {
    eyebrow: "LIMITED TIME",
    title: "Summer Sale",
    description:
      "Elevate your everyday with selected pieces, thoughtfully chosen for the season.",
    discount: "UP TO 40% OFF",
    image: "/images/sale/summer-sale.jpg",

    // Sale ends: August 18, 2026 at 23:59
    endsAt: "2026-08-18T23:59:59+02:00",

    href: "/sale",
  },

  {
    eyebrow: "HOME & LIVING",
    title: "Refresh Your Space",
    description:
      "Discover timeless pieces designed to bring comfort, character, and beauty into your home.",
    discount: "UP TO 30% OFF",
    image: "/images/sale/home-sale.jpg",

    // Sale ends: August 21, 2026 at 23:59
    endsAt: "2026-08-21T23:59:59+02:00",

    href: "/collections/home-living",
  },
];

export default function SalePromotions() {
  const [timeLeft, setTimeLeft] = useState(
  promotions.map((promotion) =>
    Math.max(
      0,
      Math.floor(
        (new Date(promotion.endsAt).getTime() - Date.now()) / 1000
      )
    )
  )
);

  useEffect(() => {
  const timer = setInterval(() => {
    setTimeLeft(
      promotions.map((promotion) =>
        Math.max(
          0,
          Math.floor(
            (new Date(promotion.endsAt).getTime() - Date.now()) / 1000
          )
        )
      )
    );
  }, 1000);

  return () => clearInterval(timer);
}, []);

  return (
    <section className="bg-[#FAFAF8] py-28 md:py-32">
      <div className="mx-auto max-w-7xl px-6">

        {/* Section Heading */}
        <div className="mb-12 text-center">

          <p className="mx-auto mb-3 text-md  font-semibold uppercase tracking-[0.4em] text-slate-400">
            Offers
          </p>

          <h2 className="text-5xl font-bold tracking-tight text-slate-900">
            Exceptional pieces.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-lg leading-6 text-slate-500">
             Available for a limited time.
          </p>

        </div>

        {/* Promotion Cards */}
        <div className="grid gap-7 lg:grid-cols-2">

          {promotions.map((promotion, index) => {
            const countdown = formatCountdown(timeLeft[index]);
            const saleEnded = timeLeft[index] === 0;

            return (
              <article
                key={promotion.title}
                className="
                  group
                  relative
                  min-h-[600px]
                  overflow-hidden
                  rounded-[32px]
                  bg-slate-900
                "
              >

                {/* Image */}
                <Image
                  src={promotion.image}
                  alt={promotion.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="
                    object-cover
                    transition-transform
                    duration-[1200ms]
                    ease-out
                    group-hover:scale-[1.04]
                  "
                />

                {/* Premium Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

                {/* Subtle top gradient */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/20 to-transparent" />

                {/* Limited Offer Badge */}
                <div className="absolute left-7 top-7 md:left-9 md:top-9">
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                    {promotion.eyebrow}
                  </span>
                </div>

                {/* Content */}
                <div className="relative flex h-full flex-col justify-end p-7 md:p-10">

                  <div className="max-w-xl">

                    <p className="text-s font-bold uppercase tracking-[0.25em] text-yellow-400">
                      {promotion.discount}
                    </p>

                    <h3 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                      {promotion.title}
                    </h3>

                    <p className="mt-4 max-w-md text-sm leading-6 text-white/70 md:text-base">
                      {promotion.description}
                    </p>

                    {/* Countdown */}
                    <div className="mt-7">

                      {saleEnded ? (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
                            Promotion
                          </p>

                          <p className="mt-3 text-lg font-medium text-white">
                            Offer ended
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
                            Offer ends in
                          </p>

                          <div className="mt-3 flex items-center gap-2">

                            <CountdownUnit
                              value={countdown.days}
                              label="Days"
                            />

                            <CountdownSeparator />

                            <CountdownUnit
                              value={countdown.hours}
                              label="Hrs"
                            />

                            <CountdownSeparator />

                            <CountdownUnit
                              value={countdown.minutes}
                              label="Min"
                            />

                            <CountdownSeparator />

                            <CountdownUnit
                              value={countdown.seconds}
                              label="Sec"
                            />

                          </div>
                        </>
                      )}

                    </div>              

                    {/* CTA */}
                    {saleEnded ? (
                      <div
                        className="
                          mt-8
                          inline-flex
                          w-fit
                          items-center
                          rounded-full
                          border
                          border-white/20
                          bg-white/10
                          px-6
                          py-3.5
                          text-sm
                          font-medium
                          text-white/60
                          backdrop-blur-sm
                        "
                      >
                        Offer ended
                      </div>
                    ) : (
                      <Link
                        href={promotion.href}
                        className="
                          mt-8
                          inline-flex
                          items-center
                          gap-2
                          rounded-full
                          bg-white
                          px-6
                          py-3.5
                          text-sm
                          font-medium
                          text-slate-900
                          transition-all
                          duration-300
                          hover:-translate-y-0.5
                          hover:bg-yellow-700
                          hover:text-white
                        "
                      >
                        Shop the offer

                        <ArrowRight
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                          strokeWidth={2}
                        />
                      </Link>
                    )}
                  </div>
                </div>

              </article>
            );
          })}

        </div>

        {/* Bottom Trust Line */}
        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

          <p>
            Limited-time offers · While selected items last
          </p>

        </div>

      </div>
    </section>
  );
}


/* -------------------------------- */
/* Countdown Components */
/* -------------------------------- */

function CountdownUnit({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="flex min-w-[48px] flex-col items-center rounded-xl border border-white/10 bg-white/[0.07] px-2.5 py-2 backdrop-blur-sm">
      <span className="text-lg font-semibold leading-none text-white md:text-xl">
        {String(value).padStart(2, "0")}
      </span>

      <span className="mt-1 text-[8px] font-medium uppercase tracking-[0.15em] text-white/40">
        {label}
      </span>
    </div>
  );
}


function CountdownSeparator() {
  return (
    <span className="text-sm text-white/30">
      :
    </span>
  );
}