"use client";

import Link from "next/link";
import {
  ArrowRight,
  Mail,
  MapPin,
} from "lucide-react";

const shopLinks = [
  { name: "Home & Living", href: "#" },
  { name: "Tech & Gadgets", href: "#" },
  { name: "Fitness", href: "#" },
  { name: "Kids", href: "#" },
];

const companyLinks = [
  { name: "About Exepra", href: "#" },
  { name: "Contact", href: "#" },
  { name: "Careers", href: "#" },
  { name: "Our Story", href: "#" },
];

const supportLinks = [
  { name: "Help Center", href: "#" },
  { name: "Shipping & Delivery", href: "#" },
  { name: "Returns & Refunds", href: "#" },
  { name: "FAQs", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">

      {/* =========================================================
          NEWSLETTER
      ========================================================== */}

      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">

            {/* Newsletter Text */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-600">
                Stay in the loop
              </p>

              <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Better living starts with the right things.
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-400">
                Get curated product discoveries, new arrivals and
                occasional inspiration delivered straight to your inbox.
              </p>
            </div>

            {/* Newsletter Form */}
            <div className="lg:justify-self-end lg:w-full lg:max-w-xl">
              <form className="flex flex-col gap-3 sm:flex-row">

                <div className="relative flex-1">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="email"
                    placeholder="Your email address"
                    aria-label="Email address"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-white/[0.06]
                      pl-11
                      pr-4
                      text-sm
                      text-white
                      placeholder:text-slate-500
                      outline-none
                      transition
                      focus:border-yellow-700
                      focus:bg-white/[0.08]
                      focus:ring-4
                      focus:ring-yellow-700/10
                    "
                  />
                </div>

                <button
                  type="submit"
                  className="
                    flex
                    h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-yellow-700
                    px-6
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-yellow-900/10
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-white
                    hover:text-slate-950
                    hover:shadow-xl
                    active:translate-y-0
                  "
                >
                  Subscribe
                  <ArrowRight size={16} />
                </button>

              </form>

              <p className="mt-3 text-xs text-slate-500">
                By subscribing, you agree to receive emails from Exepra.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN FOOTER
      ========================================================== */}

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* Brand */}
          <div>
            <Link
              href="/"
              className="
                inline-block
                text-3xl
                font-extrabold
                tracking-tight
                text-white
                transition
                hover:opacity-80
              "
            >
              exe<span className="text-yellow-600">pra</span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Elevate the way you live with carefully curated products
              designed for modern lifestyles.
            </p>

            {/* Location */}
            <div className="mt-7 flex items-center gap-3 text-sm text-slate-400">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06]">
                <MapPin
                  size={16}
                  className="text-yellow-600"
                />
              </div>

              <span>Germany</span>
            </div>

            {/* =====================================================
                SOCIAL MEDIA
            ====================================================== */}

            <div className="mt-7 flex items-center gap-3">

              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="
                  group
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.03]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-yellow-700/50
                  hover:bg-yellow-700
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-[17px] w-[17px] text-slate-400 transition-colors duration-300 group-hover:text-white"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <circle
                    cx="12"
                    cy="12"
                    r="4.2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <circle
                    cx="17.3"
                    cy="6.8"
                    r="1"
                    fill="currentColor"
                  />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="
                  group
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.03]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-yellow-700/50
                  hover:bg-yellow-700
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-[18px] w-[18px] text-slate-400 transition-colors duration-300 group-hover:text-white"
                  aria-hidden="true"
                >
                  <path
                    d="M14.2 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.6 1.7-1.6h1.8V3.5c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.2H8.2V13H11v8h3.2Z"
                  />
                </svg>
              </a>

              {/* X */}
              <a
                href="#"
                aria-label="X"
                className="
                  group
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.03]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-yellow-700/50
                  hover:bg-yellow-700
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-[16px] w-[16px] text-slate-400 transition-colors duration-300 group-hover:text-white"
                  aria-hidden="true"
                >
                  <path
                    d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.37l7.24-8.28L3 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.7h1.73L8.48 4.18H6.62L17.8 19.7Z"
                  />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="#"
                aria-label="TikTok"
                className="
                  group
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.03]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-yellow-700/50
                  hover:bg-yellow-700
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-[17px] w-[17px] text-slate-400 transition-colors duration-300 group-hover:text-white"
                  aria-hidden="true"
                >
                  <path
                    d="M16.6 3c.3 1.7 1.3 3 3 3.5v3.1c-1.5-.1-2.8-.6-4-1.4v6.4c0 4-2.7 6.4-6.3 6.4-3.2 0-5.6-2.1-5.6-5.1 0-3.3 2.8-5.4 6.1-5.4.3 0 .6 0 .9.1v3.2c-.3-.1-.6-.1-.9-.1-1.4 0-2.7.8-2.7 2.2 0 1.2.9 2.1 2.2 2.1 1.5 0 2.4-1 2.4-2.7V3h4.9Z"
                  />
                </svg>
              </a>

            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Shop
            </h3>

            <ul className="mt-6 space-y-4">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="
                      text-sm
                      text-slate-400
                      transition
                      hover:text-white
                    "
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Company
            </h3>

            <ul className="mt-6 space-y-4">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="
                      text-sm
                      text-slate-400
                      transition
                      hover:text-white
                    "
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Support
            </h3>

            <ul className="mt-6 space-y-4">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="
                      text-sm
                      text-slate-400
                      transition
                      hover:text-white
                    "
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* =========================================================
          BOTTOM BAR
      ========================================================== */}

      <div className="mx-auto max-w-7xl px-6 py-7 lg:px-8">

        <div className="flex flex-col gap-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © {new Date().getFullYear()} Exepra. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">

            <Link
              href="#"
              className="transition hover:text-slate-300"
            >
              Privacy Policy
            </Link>

            <Link
              href="#"
              className="transition hover:text-slate-300"
            >
              Terms of Service
            </Link>

            <Link
              href="#"
              className="transition hover:text-slate-300"
            >
              Imprint
            </Link>

          </div>

        </div>
      </div>

    </footer>
  );
}