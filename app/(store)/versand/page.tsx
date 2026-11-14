import type { Metadata } from "next";
import { LegalPage } from "@/components/content/legal-page";
import { getShippingRules, getStoreSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/money";
import { SUPPORTED_COUNTRIES } from "@/lib/validation";

export const metadata: Metadata = { title: "Versandinformationen", description: "Shipping costs and delivery times.", alternates: { canonical: "/versand" } };
export const revalidate = 600;

export default async function VersandPage() {
  const [rules, settings] = await Promise.all([getShippingRules(), getStoreSettings()]);
  const name = (c: string) => SUPPORTED_COUNTRIES.find((x) => x.code === c)?.name ?? c;
  return (
    <LegalPage title="Versandinformationen" subtitle="Shipping information" lang="en" draft={false}>
      <p>{settings.smallBusiness ? "All prices are final prices; as a small business under § 19 UStG we do not charge VAT." : "All prices include VAT."} Shipping costs depend on the destination and delivery method and are shown before you pay. Delivery times are in business days (Mon–Fri) after payment has been received.</p>
      <div className="not-prose mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Method</th>
              <th className="px-5 py-3 font-medium">Destinations</th>
              <th className="px-5 py-3 font-medium">Delivery time</th>
              <th className="px-5 py-3 font-medium">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rules.map((r) => (
              <tr key={r.code}>
                <td className="px-5 py-4 font-medium">{r.name}{r.description && <span className="block text-xs font-normal text-muted">{r.description}</span>}</td>
                <td className="px-5 py-4 text-muted">{r.countries.map(name).join(", ")}</td>
                <td className="px-5 py-4">{r.minDays}–{r.maxDays} days</td>
                <td className="px-5 py-4">{formatPrice(r.price)}{r.freeOver ? <span className="block text-xs text-success">Free from {formatPrice(r.freeOver)}</span> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>Tracking</h2>
      <p>As soon as your order has shipped, you&apos;ll receive an email with tracking information. You can also check your order status at any time on our order tracking page.</p>
    </LegalPage>
  );
}
