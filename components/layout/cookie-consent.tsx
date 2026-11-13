"use client";

import Link from "next/link";
import Script from "next/script";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

export const CONSENT_COOKIE = "exepra_consent";
const CONSENT_VERSION = 1;

export type Consent = { v: number; necessary: true; analytics: boolean; marketing: boolean; ts: string };

function readConsent(): Consent | null {
  const raw = document.cookie.split("; ").find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw.split("=").slice(1).join("=")));
    return parsed.v === CONSENT_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

function writeConsent(c: Omit<Consent, "v" | "necessary" | "ts">) {
  const value: Consent = { v: CONSENT_VERSION, necessary: true, ts: new Date().toISOString(), ...c };
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(value))}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent("exepra:consent", { detail: value }));
  return value;
}

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event("exepra:open-consent"))}>
      Cookie settings
    </button>
  );
}

/**
 * Consent banner. Only strictly necessary cookies (session, cart, consent itself) are set
 * before consent. Optional analytics loads only after explicit opt-in.
 */
function subscribe(onChange: () => void) {
  window.addEventListener("exepra:consent", onChange);
  return () => window.removeEventListener("exepra:consent", onChange);
}
const SERVER = "__server__";
const getSnapshot = () => document.cookie.split("; ").find((c) => c.startsWith(`${CONSENT_COOKIE}=`)) ?? "";
const getServerSnapshot = () => SERVER;

export function CookieConsent() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = raw !== SERVER;
  // raw changes whenever the consent cookie does; parse it on each change
  const consent = hydrated && raw ? readConsent() : null;
  const [reopened, setOpen] = useState(false);
  const open = reopened || (hydrated && consent === null);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const reopen = () => {
      const cur = readConsent();
      setAnalytics(cur?.analytics ?? false);
      setMarketing(cur?.marketing ?? false);
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener("exepra:open-consent", reopen);
    return () => window.removeEventListener("exepra:open-consent", reopen);
  }, []);

  const save = (c: { analytics: boolean; marketing: boolean }) => {
    writeConsent(c);
    setOpen(false);
  };

  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <>
      {consent?.analytics && plausibleDomain && (
        <Script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js" strategy="afterInteractive" />
      )}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-labelledby="consent-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-3 bottom-3 z-[95] mx-auto max-w-2xl rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-lift sm:inset-x-6 sm:bottom-6 sm:p-6"
          >
            <h2 id="consent-title" className="text-base font-semibold">
              Your privacy choices
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              We use strictly necessary cookies to run our shop (e.g. your bag, sign-in and these settings). With your consent we&apos;d also like to use privacy-friendly analytics to improve the store. You can change your choice at any time via “Cookie settings” in the footer.{" "}
              <Link href="/cookie-richtlinie" className="text-bronze-deep underline underline-offset-2">
                Cookie policy
              </Link>
            </p>

            {details && (
              <div className="mt-4 space-y-3 rounded-xl bg-ivory p-4 text-sm">
                <label className="flex items-start gap-3">
                  <input type="checkbox" checked disabled className="mt-1 h-4 w-4 accent-[#1f1d1b]" />
                  <span>
                    <span className="font-medium">Strictly necessary</span> — always on. Session, shopping bag, wishlist, security and consent storage.
                  </span>
                </label>
                <label className="flex items-start gap-3">
                  <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-1 h-4 w-4 accent-[#1f1d1b]" />
                  <span>
                    <span className="font-medium">Analytics</span> — anonymous, aggregated statistics about how the shop is used.
                  </span>
                </label>
                <label className="flex items-start gap-3">
                  <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-1 h-4 w-4 accent-[#1f1d1b]" />
                  <span>
                    <span className="font-medium">Marketing</span> — currently not in use. If introduced, nothing will load without this permission.
                  </span>
                </label>
              </div>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {details ? (
                <Button variant="outline" size="sm" onClick={() => save({ analytics, marketing })}>
                  Save selection
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setDetails(true)}>
                  Customise
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => save({ analytics: false, marketing: false })}>
                Necessary only
              </Button>
              <Button size="sm" onClick={() => save({ analytics: true, marketing: true })}>
                Accept all
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
