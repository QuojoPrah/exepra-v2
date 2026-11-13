import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = { title: "FAQ", description: "Answers to common questions about orders, shipping, payment and returns at EXEPRA.", alternates: { canonical: "/faq" } };

const faqs: { q: string; a: React.ReactNode; text: string }[] = [
  { q: "Which countries do you deliver to?", text: "We currently deliver to Germany and selected EU countries. Available destinations and costs are shown at checkout and on our shipping page.", a: <>We currently deliver to Germany and selected EU countries. Available destinations and costs are shown at checkout and on our <Link href="/versand">shipping page</Link>.</> },
  { q: "How long does delivery take?", text: "Delivery times depend on the method you choose and are shown at checkout. Orders ship once payment has been confirmed.", a: <>Delivery times depend on the method you choose and are shown at checkout. Orders ship once payment has been confirmed.</> },
  { q: "Which payment methods can I use?", text: "Payments are processed securely by Stripe. The payment methods available to you are displayed on the payment page.", a: <>Payments are processed securely by Stripe. The payment methods available to you are displayed on the payment page.</> },
  { q: "Do I need an account to order?", text: "No — you can check out as a guest. An account lets you track orders, save addresses and keep your wishlist across devices.", a: <>No — you can check out as a guest. An account lets you track orders, save addresses and keep your wishlist across devices.</> },
  { q: "How do I track my order?", text: "You'll receive an email when your order ships. You can also enter your order number and email on our Track Order page.", a: <>You&apos;ll receive an email when your order ships. You can also enter your order number and email on our <Link href="/track-order">Track Order</Link> page.</> },
  { q: "Can I return an item?", text: "Yes. You have a statutory 14-day right of withdrawal. See our returns page and cancellation policy for details.", a: <>Yes. You have a statutory 14-day right of withdrawal. See our <Link href="/rueckgabe">returns page</Link> and <Link href="/widerrufsbelehrung">cancellation policy</Link>.</> },
  { q: "Are prices inclusive of VAT?", text: "Yes, all prices include German VAT. Shipping costs are added at checkout.", a: <>Yes, all prices include German VAT. Shipping costs are added at checkout.</> },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.text } })),
  };
  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "FAQ" }]} />
      <h1 className="mt-4 text-4xl font-semibold">Frequently asked questions</h1>
      <div className="mt-10 divide-y divide-line border-y border-line">
        {faqs.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium">
              {f.q}
              <span className="text-xl text-muted transition group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <div className="prose-legal mt-3">{f.a}</div>
          </details>
        ))}
      </div>
      <p className="mt-10 text-muted">Still have questions? <Link href="/contact" className="font-medium text-ink underline underline-offset-2">Contact us</Link>.</p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
