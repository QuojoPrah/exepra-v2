import type { Metadata } from "next";
import { LegalPage, P } from "@/components/content/legal-page";

export const metadata: Metadata = { title: "Impressum", alternates: { canonical: "/impressum" } };

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum" subtitle="Angaben gemäß § 5 DDG">
      <h2>Anbieter</h2>
      <p>
        <P>Vollständiger Firmenname inkl. Rechtsform</P>
        <br />
        <P>Straße und Hausnummer</P>
        <br />
        <P>PLZ Ort</P>
        <br />
        Deutschland
      </p>
      <h2>Vertreten durch</h2>
      <p><P>Name der/des Geschäftsführer(s) bzw. Inhaber(in)</P></p>
      <h2>Kontakt</h2>
      <p>
        E-Mail: <P>kontakt@ihre-domain.de</P>
        <br />
        Telefon: <P>Telefonnummer</P>
      </p>
      <h2>Registereintrag</h2>
      <p>
        Registergericht: <P>Amtsgericht …</P>
        <br />
        Registernummer: <P>HRB …</P> <em>(entfällt bei Einzelunternehmen ohne Eintragung)</em>
      </p>
      <h2>Umsatzsteuer-ID</h2>
      <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: <P>DE…</P></p>
      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p><P>Name, Anschrift</P></p>
      <h2>EU-Streitschlichtung</h2>
      <p>
        <P>Hinweis zur Online-Streitbeilegung prüfen lassen — die EU-OS-Plattform wurde zum 20.07.2025 eingestellt; die bisherige Verlinkungspflicht entfällt.</P>
      </p>
      <h2>Verbraucherstreitbeilegung</h2>
      <p><P>Angabe, ob Sie bereit oder verpflichtet sind, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG).</P></p>
    </LegalPage>
  );
}
