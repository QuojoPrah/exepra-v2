"use client";

import Image from "next/image";
import Link from "next/link";
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

    // DEMO DATE — replace with the real campaign date later.
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

    // DEMO DATE — replace with the real campaign date later.
    endsAt: "2026-08-21T23:59:59+02:00",

    href: "/collections/home-living",
  },
];

export default function SalePromotions() {
  const [timeLeft, setTimeLeft] = useState<number[]>(
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
    const updateCountdown = () => {
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
    };

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-[#FAFAF8] py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-slate-400">
            OFFERS
          </p>

          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Exceptional pieces.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-500 md:text-lg">
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
                className="group relative min-h-[600px] overflow-hidden rounded-[32px] bg-slate-900"
              >
                {/* Image */}
                <Image
                  src={promotion.image}
                  alt={promotion.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                />

                {/* Cinematic Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

                {/* Subtle Top Gradient */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/20 to-transparent" />

                {/* Eyebrow */}
                <div className="absolute left-7 top-7 md:left-9 md:top-9">
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                    {promotion.eyebrow}
                  </span>
                </div>

                {/* Content */}
                <div className="relative flex h-full flex-col justify-end p-7 md:p-10">
                  <div className="max-w-xl">
                    {/* Discount */}
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-400">
                      {promotion.discount}
                    </p>

                    {/* Title */}
                    <h3 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
                      {promotion.title}
                    </h3>

                    {/* Description */}
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
                      <div className="mt-8 inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-medium text-white/60 backdrop-blur-sm">
                        Offer ended
                      </div>
                    ) : (
                      <Link
                        href={promotion.href}
                        className="group/cta mt-8 inline-flex h-12 min-w-[150px] items-center justify-center gap-3 rounded-full bg-white px-6 text-sm font-semibold text-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                      >
                        <span>Shop the offer</span>

                        <span
                          aria-hidden="true"
                          className="flex items-center transition-transform duration-300 group-hover/cta:translate-x-1"
                        >
                          <svg
                            width="7"
                            height="12"
                            viewBox="0 0 7 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 1L6 6L1 11"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
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
          <p>Limited-time offers · While selected items last</p>
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
  return <span className="text-sm text-white/30">:</span>;
}