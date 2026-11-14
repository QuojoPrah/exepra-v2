import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/content/legal-page";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = { title: "Rückgabe & Erstattung", description: "Returns and refunds.", alternates: { canonical: "/rueckgabe" } };

export default function RueckgabePage() {
  return (
    <LegalPage title="Rückgabe & Erstattung" subtitle="Returns & Refunds" lang="en">
      <p>As a consumer you have a statutory 14-day right of withdrawal. The legally binding details are set out in our <Link href="/widerrufsbelehrung">Widerrufsbelehrung (cancellation policy)</Link>.</p>
      <h2>How to return an item</h2>
      <ol>
        <li>Let us know within 14 days of receiving your order — e.g. via our <Link href="/contact">contact form</Link> or by email to <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>, quoting your order number.</li>
        <li>Pack the items securely. We don&apos;t provide a return label; please use a tracked service of your choice and keep the receipt.</li>
        <li>Send the parcel to: {BUSINESS.owner}, {BUSINESS.brand}, {BUSINESS.street}, {BUSINESS.postalCode} {BUSINESS.city}, Germany.</li>
      </ol>
      <h2>Return shipping costs</h2>
      <p>If you withdraw from your purchase, you bear the direct cost of returning the goods.</p>
      <h2>Refunds</h2>
      <p>Refunds are issued to your original payment method within 14 days of receiving your withdrawal notice; we may withhold the refund until we have received the goods or proof of return. You&apos;ll receive an email as soon as the refund has been processed.</p>
      <h2>Faulty or damaged items</h2>
      <p>If an item arrives damaged or faulty, please contact us — the statutory warranty rights apply.</p>
    </LegalPage>
  );
}
