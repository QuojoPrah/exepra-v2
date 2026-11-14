import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/content/legal-page";
import { BUSINESS, BUSINESS_LINE } from "@/lib/business";

export const metadata: Metadata = { title: "Datenschutzerklärung", alternates: { canonical: "/datenschutz" } };

export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung" subtitle="Privacy Policy">
      <h2>1. Verantwortlicher</h2>
      <p>
        {BUSINESS_LINE}
        <br />
        E-Mail: {BUSINESS.email}, Telefon: {BUSINESS.phone} (siehe <Link href="/impressum">Impressum</Link>).
      </p>

      <h2>2. Überblick über die Verarbeitungen</h2>
      <p>Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung unseres Onlineshops, zur Vertragsabwicklung, aufgrund gesetzlicher Pflichten oder mit Ihrer Einwilligung erforderlich ist.</p>

      <h2>3. Bestellungen und Kundenkonto</h2>
      <p>Für die Abwicklung von Bestellungen verarbeiten wir Name, E-Mail-Adresse, Liefer- und Rechnungsadresse, ggf. Telefonnummer, Bestelldaten sowie Zahlungsstatus (Art. 6 Abs. 1 lit. b DSGVO). Rechnungs- und Bestelldaten bewahren wir gemäß handels- und steuerrechtlicher Aufbewahrungspflichten (§ 147 AO, § 257 HGB) bis zu 10 Jahre auf (Art. 6 Abs. 1 lit. c DSGVO). Ein Kundenkonto ist freiwillig; Sie können es jederzeit in Ihrem Konto löschen und Ihre Daten exportieren.</p>

      <h2>4. Zahlungsabwicklung</h2>
      <p>Zahlungen werden über Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Dublin 2, Irland, abgewickelt. Zahlungsdaten (z. B. Kartendaten) werden ausschließlich von Stripe verarbeitet und nicht auf unseren Servern gespeichert. Dabei können Daten auch in die USA übermittelt werden. Näheres finden Sie in der <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer">Datenschutzerklärung von Stripe</a>.</p>

      <h2>5. Hosting und Infrastruktur</h2>
      <p>
        Unsere Website wird bei Vercel Inc. (USA) gehostet; die Anwendung wird in der Region Frankfurt am Main ausgeführt. Die Datenbank mit Kunden- und Bestelldaten wird bei Neon (Region Frankfurt am Main) betrieben. Produktbilder werden bei Cloudinary Ltd. gespeichert. Diese Anbieter verarbeiten Daten in unserem Auftrag (Art. 28 DSGVO); Rechtsgrundlage ist unser berechtigtes Interesse an einem sicheren und zuverlässigen Betrieb des Onlineshops (Art. 6 Abs. 1 lit. f DSGVO). Dabei kann ein Zugriff aus den USA nicht ausgeschlossen werden.
      </p>

      <h2>6. E-Mail-Versand</h2>
      <p>Transaktionale E-Mails (Bestellbestätigung, Versandbenachrichtigung, Passwort-Zurücksetzen) versenden wir über den Dienst Resend (Resend, Inc., USA; Versand über Server in der EU) (Art. 6 Abs. 1 lit. b DSGVO).</p>

      <h2>7. Newsletter</h2>
      <p>Den Newsletter erhalten Sie nur mit Ihrer ausdrücklichen Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) im Double-Opt-In-Verfahren. Wir protokollieren Zeitpunkt, IP-Adresse und den Wortlaut der Einwilligung. Sie können sich jederzeit über den Abmeldelink in jeder E-Mail abmelden.</p>

      <h2>8. Cookies und Analyse</h2>
      <p>
        Wir setzen technisch notwendige Cookies (Sitzung, Warenkorb, Merkliste, Einwilligungsstatus) auf Grundlage von § 25 Abs. 2 TDDDG ein. Optionale Analyse findet nur nach Ihrer Einwilligung statt (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1 lit. a DSGVO). Details in unserer <Link href="/cookie-richtlinie">Cookie-Richtlinie</Link>. Derzeit setzen wir kein Analysetool ein.
      </p>

      <h2>9. Kundenbewertungen und Kontaktformular</h2>
      <p>Bei Bewertungen speichern wir den von Ihnen gewählten Anzeigenamen, Bewertung und Text. Anfragen über das Kontaktformular verarbeiten wir zur Beantwortung Ihres Anliegens (Art. 6 Abs. 1 lit. b bzw. f DSGVO).</p>

      <h2>10. Ihre Rechte</h2>
      <p>Sie haben das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO) sowie das Recht, erteilte Einwilligungen jederzeit zu widerrufen. Sie können sich zudem bei einer Datenschutz-Aufsichtsbehörde beschweren. Für uns zuständig ist das Unabhängige Datenschutzzentrum Saarland, Saarbrücken.</p>

      <h2>11. Stand</h2>
      <p>November 2026</p>
    </LegalPage>
  );
}
