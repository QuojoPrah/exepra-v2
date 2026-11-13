import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, P } from "@/components/content/legal-page";

export const metadata: Metadata = { title: "Datenschutzerklärung", alternates: { canonical: "/datenschutz" } };

export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung" subtitle="Privacy Policy">
      <h2>1. Verantwortlicher</h2>
      <p>
        <P>Firmenname, Anschrift, E-Mail, Telefon</P> (siehe <Link href="/impressum">Impressum</Link>).
        <br />
        Datenschutzbeauftragte(r): <P>Name/Kontakt, falls benannt</P>
      </p>

      <h2>2. Überblick über die Verarbeitungen</h2>
      <p>Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung unseres Onlineshops, zur Vertragsabwicklung, aufgrund gesetzlicher Pflichten oder mit Ihrer Einwilligung erforderlich ist.</p>

      <h2>3. Bestellungen und Kundenkonto</h2>
      <p>Für die Abwicklung von Bestellungen verarbeiten wir Name, E-Mail-Adresse, Liefer- und Rechnungsadresse, ggf. Telefonnummer, Bestelldaten sowie Zahlungsstatus (Art. 6 Abs. 1 lit. b DSGVO). Rechnungs- und Bestelldaten bewahren wir gemäß handels- und steuerrechtlicher Aufbewahrungspflichten (§ 147 AO, § 257 HGB) bis zu 10 Jahre auf (Art. 6 Abs. 1 lit. c DSGVO). Ein Kundenkonto ist freiwillig; Sie können es jederzeit in Ihrem Konto löschen und Ihre Daten exportieren.</p>

      <h2>4. Zahlungsabwicklung</h2>
      <p>Zahlungen werden über Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Dublin 2, Irland, abgewickelt. Zahlungsdaten (z. B. Kartendaten) werden ausschließlich von Stripe verarbeitet und nicht auf unseren Servern gespeichert. <P>Datenschutzhinweise von Stripe verlinken und Angaben zu Drittlandübermittlungen ergänzen.</P></p>

      <h2>5. Hosting und Infrastruktur</h2>
      <p>
        <P>Hosting-Anbieter (z. B. Vercel Inc.), Datenbank-Anbieter (z. B. Neon), Bildspeicher (z. B. Cloudinary) inkl. Serverstandort, Auftragsverarbeitungsvertrag (Art. 28 DSGVO) und Rechtsgrundlage für Drittlandübermittlungen (z. B. EU-US Data Privacy Framework / Standardvertragsklauseln) eintragen.</P>
      </p>

      <h2>6. E-Mail-Versand</h2>
      <p>Transaktionale E-Mails (Bestellbestätigung, Versandbenachrichtigung, Passwort-Zurücksetzen) versenden wir über <P>Resend, Inc. — Angaben ergänzen</P> (Art. 6 Abs. 1 lit. b DSGVO).</p>

      <h2>7. Newsletter</h2>
      <p>Den Newsletter erhalten Sie nur mit Ihrer ausdrücklichen Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) im Double-Opt-In-Verfahren. Wir protokollieren Zeitpunkt, IP-Adresse und den Wortlaut der Einwilligung. Sie können sich jederzeit über den Abmeldelink in jeder E-Mail abmelden.</p>

      <h2>8. Cookies und Analyse</h2>
      <p>
        Wir setzen technisch notwendige Cookies (Sitzung, Warenkorb, Merkliste, Einwilligungsstatus) auf Grundlage von § 25 Abs. 2 TDDDG ein. Optionale Analyse findet nur nach Ihrer Einwilligung statt (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1 lit. a DSGVO). Details in unserer <Link href="/cookie-richtlinie">Cookie-Richtlinie</Link>. <P>Eingesetztes Analysetool (z. B. Plausible Analytics) benennen.</P>
      </p>

      <h2>9. Kundenbewertungen und Kontaktformular</h2>
      <p>Bei Bewertungen speichern wir den von Ihnen gewählten Anzeigenamen, Bewertung und Text. Anfragen über das Kontaktformular verarbeiten wir zur Beantwortung Ihres Anliegens (Art. 6 Abs. 1 lit. b bzw. f DSGVO).</p>

      <h2>10. Ihre Rechte</h2>
      <p>Sie haben das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO) sowie das Recht, erteilte Einwilligungen jederzeit zu widerrufen. Sie können sich zudem bei einer Datenschutz-Aufsichtsbehörde beschweren. <P>Zuständige Aufsichtsbehörde des Bundeslandes eintragen.</P></p>

      <h2>11. Stand</h2>
      <p><P>Datum</P></p>
    </LegalPage>
  );
}
