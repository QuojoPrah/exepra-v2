import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, P } from "@/components/content/legal-page";

export const metadata: Metadata = { title: "Allgemeine Geschäftsbedingungen (AGB)", alternates: { canonical: "/agb" } };

export default function AgbPage() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen" subtitle="Terms and Conditions">
      <h2>§ 1 Geltungsbereich</h2>
      <p>Diese AGB gelten für alle Bestellungen über den Onlineshop EXEPRA zwischen <P>Firmenname, Anschrift</P> (nachfolgend „wir“) und Ihnen als Kunde.</p>
      <h2>§ 2 Vertragsschluss</h2>
      <p>Die Darstellung der Produkte im Onlineshop stellt kein rechtlich bindendes Angebot dar. Durch Klicken des Buttons „Jetzt kaufen“ (bzw. „Buy now“) geben Sie eine verbindliche Bestellung ab. <P>Zeitpunkt der Annahme (z. B. mit Zahlungsbestätigung/Versandbestätigung) festlegen und prüfen lassen.</P></p>
      <h2>§ 3 Preise und Versandkosten</h2>
      <p>Alle Preise sind Endpreise inkl. der gesetzlichen Mehrwertsteuer, zzgl. Versandkosten. Die Versandkosten werden im Bestellprozess angezeigt; siehe <Link href="/versand">Versandinformationen</Link>.</p>
      <h2>§ 4 Zahlung</h2>
      <p>Die verfügbaren Zahlungsarten werden im Bestellprozess angezeigt. Die Zahlung wird über den Zahlungsdienstleister Stripe abgewickelt.</p>
      <h2>§ 5 Lieferung</h2>
      <p><P>Liefergebiete, Lieferzeiten, Teillieferungen</P></p>
      <h2>§ 6 Eigentumsvorbehalt</h2>
      <p>Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.</p>
      <h2>§ 7 Widerrufsrecht</h2>
      <p>Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Einzelheiten in unserer <Link href="/widerrufsbelehrung">Widerrufsbelehrung</Link>.</p>
      <h2>§ 8 Gewährleistung</h2>
      <p>Es gilt das gesetzliche Mängelhaftungsrecht.</p>
      <h2>§ 9 Vertragssprache, Speicherung des Vertragstextes</h2>
      <p><P>Vertragssprache(n) und Hinweis zur Speicherung des Vertragstextes ergänzen.</P></p>
      <h2>§ 10 Schlussbestimmungen</h2>
      <p><P>Rechtswahl / Gerichtsstand — nur soweit zulässig, rechtlich prüfen lassen.</P></p>
    </LegalPage>
  );
}
