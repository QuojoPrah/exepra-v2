import Link from "next/link";
import { Globe, Lock } from "lucide-react";
import ExepraLogo from "@/components/layout/ExepraLogo";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { CookieSettingsButton } from "@/components/layout/cookie-consent";

const columns = [
  {
    title: "Shop",
    links: [
      { name: "Women", href: "/women" },
      { name: "Kids", href: "/kids" },
      { name: "Accessories", href: "/accessories" },
      { name: "New Arrivals", href: "/new-arrivals" },
      { name: "Best Sellers", href: "/shop?sort=best-selling" },
      { name: "Sale", href: "/sale" },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { name: "Contact Us", href: "/contact" },
      { name: "FAQ", href: "/faq" },
      { name: "Shipping Information", href: "/versand" },
      { name: "Returns & Refunds", href: "/rueckgabe" },
      { name: "Track Order", href: "/track-order" },
    ],
  },
  {
    title: "Information",
    links: [
      { name: "About EXEPRA", href: "/about" },
      { name: "Impressum", href: "/impressum" },
      { name: "Privacy Policy", href: "/datenschutz" },
      { name: "Terms and Conditions", href: "/agb" },
      { name: "Cancellation Policy", href: "/widerrufsbelehrung" },
      { name: "Cookie Policy", href: "/cookie-richtlinie" },
    ],
  },
];

type Social = { instagramUrl: string | null; facebookUrl: string | null; tiktokUrl: string | null; pinterestUrl: string | null; smallBusiness?: boolean };

const socialIcons: Record<string, React.ReactNode> = {
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" className="h-[17px] w-[17px]" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.8" r="1" fill="currentColor" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden>
      <path d="M14.2 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.6 1.7-1.6h1.8V3.5c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.2H8.2V13H11v8h3.2Z" />
    </svg>
  ),
  TikTok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[17px] w-[17px]" aria-hidden>
      <path d="M16.6 3c.3 1.7 1.3 3 3 3.5v3.1c-1.5-.1-2.8-.6-4-1.4v6.4c0 4-2.7 6.4-6.3 6.4-3.2 0-5.6-2.1-5.6-5.1 0-3.3 2.8-5.4 6.1-5.4.3 0 .6 0 .9.1v3.2c-.3-.1-.6-.1-.9-.1-1.4 0-2.7.8-2.7 2.2 0 1.2.9 2.1 2.2 2.1 1.5 0 2.4-1 2.4-2.7V3h4.9Z" />
    </svg>
  ),
  Pinterest: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[17px] w-[17px]" aria-hidden>
      <path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.5 1.8-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.9 1.6 1.9 1.9 0 3.3-2 3.3-4.9 0-2.6-1.8-4.3-4.5-4.3-3 0-4.8 2.3-4.8 4.6 0 .9.4 1.9.8 2.4l.1.4-.3 1.2c0 .2-.2.3-.4.2-1.4-.6-2.2-2.6-2.2-4.2 0-3.4 2.5-6.6 7.2-6.6 3.8 0 6.7 2.7 6.7 6.3 0 3.7-2.4 6.8-5.6 6.8-1.1 0-2.2-.6-2.5-1.3l-.7 2.6c-.3 1-.9 2.2-1.4 2.9A10 10 0 1 0 12 2Z" />
    </svg>
  ),
};

export default function Footer({ social, tagline }: { social: Social; tagline?: string | null }) {
  const socials = [
    { name: "Instagram", href: social.instagramUrl },
    { name: "Facebook", href: social.facebookUrl },
    { name: "TikTok", href: social.tiktokUrl },
    { name: "Pinterest", href: social.pinterestUrl },
  ].filter((s): s is { name: string; href: string } => Boolean(s.href));

  return (
    <footer className="mt-auto bg-ink text-white/70">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-10 lg:py-20">
        <div className="max-w-sm">
          <ExepraLogo light className="text-[30px]" />
          <p className="mt-5 text-sm leading-7">
            {tagline ?? "Thoughtfully selected fashion and essentials for women and little ones — chosen for quality, style and everyday practicality."}
          </p>
          <div className="mt-8">
            <p className="font-display text-base font-medium text-white">Join our newsletter</p>
            <p className="mb-4 mt-1 text-sm">New arrivals, styling notes and members-only offers.</p>
            <NewsletterForm />
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-white">{col.title}</h2>
            <ul className="mt-6 space-y-3.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors hover:text-white">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-5 py-7 text-xs lg:flex-row lg:items-center lg:justify-between">
          <p>© {new Date().getFullYear()} EXEPRA. All rights reserved. {social.smallBusiness ? "Final prices, plus shipping. No VAT is charged (§ 19 UStG)." : "Prices include VAT, plus shipping."}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" aria-hidden /> Secure checkout by Stripe · payment options shown at checkout
            </span>
            <span className="flex items-center gap-1.5" title="Currently shipping to Germany and selected EU countries">
              <Globe className="h-3.5 w-3.5" aria-hidden /> Deutschland · EUR €
            </span>
            <CookieSettingsButton className="underline-offset-2 hover:text-white hover:underline" />
          </div>
          {socials.length > 0 && (
            <ul className="flex items-center gap-2">
              {socials.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`EXEPRA on ${s.name}`} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition hover:border-white/40 hover:text-white">
                    {socialIcons[s.name]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
