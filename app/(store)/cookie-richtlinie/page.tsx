import type { Metadata } from "next";
import { LegalPage } from "@/components/content/legal-page";
import { CookieSettingsButton } from "@/components/layout/cookie-consent";

export const metadata: Metadata = { title: "Cookie-Richtlinie", alternates: { canonical: "/cookie-richtlinie" } };

const cookies = [
  { name: "better-auth.session_token", purpose: "Keeps you signed in to your account", type: "Strictly necessary", duration: "30 days" },
  { name: "better-auth.session_data", purpose: "Short-lived cache of your session to speed up page loads", type: "Strictly necessary", duration: "5 minutes" },
  { name: "exepra_cart", purpose: "Remembers your shopping bag as a guest", type: "Strictly necessary", duration: "60 days" },
  { name: "exepra_wishlist", purpose: "Remembers your wishlist as a guest", type: "Strictly necessary", duration: "180 days" },
  { name: "exepra_consent", purpose: "Stores your cookie choices", type: "Strictly necessary", duration: "12 months" },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie-Richtlinie" subtitle="Cookie Policy" lang="en">
      <p>We only use cookies that are strictly necessary to run the shop, unless you give your consent. Optional analytics is only loaded after you opt in, and you can change your choice at any time.</p>
      <p><CookieSettingsButton className="font-medium text-bronze-deep underline underline-offset-2" /></p>
      <h2>Cookies we use</h2>
      <div className="not-prose overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <tr><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Purpose</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Duration</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {cookies.map((c) => (
              <tr key={c.name}><td className="px-4 py-3 font-mono text-xs">{c.name}</td><td className="px-4 py-3">{c.purpose}</td><td className="px-4 py-3">{c.type}</td><td className="px-4 py-3">{c.duration}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>Analytics (optional)</h2>
      <p>If enabled by the store and accepted by you, we use a privacy-friendly, cookieless analytics service to count page views in aggregate. It is never loaded without your consent. Recent searches are stored only in your browser&apos;s local storage and never sent to us.</p>
      <h2>Marketing</h2>
      <p>We currently do not use marketing or advertising cookies.</p>
    </LegalPage>
  );
}
