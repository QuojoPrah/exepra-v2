import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/content/legal-page";
import { BUSINESS_LINE } from "@/lib/business";

export const metadata: Metadata = { title: "Allgemeine Geschäftsbedingungen (AGB)", alternates: { canonical: "/agb" } };

export default function AgbPage() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen" subtitle="Terms and Conditions">
      <h2>§ 1 Geltungsbereich</h2>
      <p>Diese AGB gelten für alle Bestellungen über den Onlineshop EXEPRA zwischen {BUSINESS_LINE} (nachfolgend „wir“) und Ihnen als Kunde.</p>
      <h2>§ 2 Vertragsschluss</h2>
      <p>Die Darstellung der Produkte im Onlineshop stellt kein rechtlich bindendes Angebot dar. Durch Klicken des Buttons „Jetzt kaufen“ (bzw. „Buy now“) geben Sie eine verbindliche Bestellung ab. Der Vertrag kommt zustande, sobald die Zahlung erfolgreich abgeschlossen ist und wir Ihre Bestellung per E-Mail bestätigen.</p>
      <h2>§ 3 Preise und Versandkosten</h2>
      <p>Alle Preise sind Endpreise zzgl. Versandkosten. Gemäß § 19 UStG (Kleinunternehmerregelung) wird keine Umsatzsteuer berechnet und daher nicht ausgewiesen. Die Versandkosten werden im Bestellprozess angezeigt; siehe <Link href="/versand">Versandinformationen</Link>.</p>
      <h2>§ 4 Zahlung</h2>
      <p>Die verfügbaren Zahlungsarten werden im Bestellprozess angezeigt. Die Zahlung wird über den Zahlungsdienstleister Stripe abgewickelt.</p>
      <h2>§ 5 Lieferung</h2>
      <p>Wir liefern nach Deutschland und in ausgewählte EU-Länder. Liefergebiete, Versandkosten und Lieferzeiten finden Sie in den <Link href="/versand">Versandinformationen</Link>; sie werden außerdem im Bestellprozess angezeigt.</p>
      <h2>§ 6 Eigentumsvorbehalt</h2>
      <p>Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.</p>
      <h2>§ 7 Widerrufsrecht</h2>
      <p>Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Einzelheiten in unserer <Link href="/widerrufsbelehrung">Widerrufsbelehrung</Link>.</p>
      <h2>§ 8 Gewährleistung</h2>
      <p>Es gilt das gesetzliche Mängelhaftungsrecht.</p>
      <h2>§ 9 Vertragssprache, Speicherung des Vertragstextes</h2>
      <p>Vertragssprachen sind Deutsch und Englisch. Wir speichern den Vertragstext; Ihre Bestelldaten erhalten Sie per E-Mail. Registrierte Kunden können ihre Bestellungen zudem im Kundenkonto einsehen.</p>
      <h2>§ 10 Schlussbestimmungen</h2>
      <p>Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Zwingende Verbraucherschutzvorschriften des Staates, in dem Sie Ihren gewöhnlichen Aufenthalt haben, bleiben unberührt.</p>
    </LegalPage>
  );
}
