import type { Metadata } from "next";
import { LegalPage } from "@/components/content/legal-page";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = { title: "Impressum", alternates: { canonical: "/impressum" } };

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum" subtitle="Angaben gemäß § 5 DDG" draft={false}>
      <h2>Anbieter</h2>
      <p>
        {BUSINESS.owner}
        <br />
        {BUSINESS.brand}
        <br />
        {BUSINESS.street}
        <br />
        {BUSINESS.postalCode} {BUSINESS.city}
        <br />
        {BUSINESS.country}
      </p>
      <p>Inhaber: {BUSINESS.owner} (Einzelunternehmen)</p>
      <h2>Kontakt</h2>
      <p>
        E-Mail: <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
        <br />
        Telefon: <a href={`tel:${BUSINESS.phoneHref}`}>{BUSINESS.phone}</a>
      </p>
      <h2>Umsatzsteuer</h2>
      <p>Gemäß § 19 UStG wird keine Umsatzsteuer berechnet und daher nicht ausgewiesen (Kleinunternehmerregelung).</p>
      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>
        {BUSINESS.owner}, {BUSINESS.street}, {BUSINESS.postalCode} {BUSINESS.city}
      </p>
    </LegalPage>
  );
}
