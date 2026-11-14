import { CheckCircle2, XCircle } from "lucide-react";
import { ActionForm, Card, Check, F, PageHeader } from "@/components/admin/ui";
import { deleteShippingRate, saveShippingRate, saveStoreSettings } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { getStoreSettings, integrationStatus } from "@/lib/settings";
import { centsToEuroInput, formatPrice } from "@/lib/money";

export const metadata = { title: "Settings" };

type R = { id?: string; code?: string; name?: string; description?: string | null; countries?: string[]; price?: number; freeOver?: number | null; minDays?: number; maxDays?: number; sortOrder?: number; isActive?: boolean };

function RateFields({ r }: { r: R }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {r.id && <input type="hidden" name="id" value={r.id} />}
      <F label="Code" name="code" defaultValue={r.code} required hint="e.g. de-standard" />
      <F label="Name" name="name" defaultValue={r.name} required />
      <F label="Description" name="description" defaultValue={r.description} />
      <F label="Countries (ISO codes)" name="countries" defaultValue={r.countries?.join(", ")} required hint="DE, AT, NL" />
      <F label="Price (€)" name="price" defaultValue={centsToEuroInput(r.price)} required />
      <F label="Free from (€)" name="freeOver" defaultValue={centsToEuroInput(r.freeOver)} hint="Empty = never free" />
      <F label="Min. days" name="minDays" type="number" defaultValue={r.minDays ?? 2} />
      <F label="Max. days" name="maxDays" type="number" defaultValue={r.maxDays ?? 4} />
      <F label="Order" name="sortOrder" type="number" defaultValue={r.sortOrder ?? 0} />
      <div className="sm:col-span-3"><Check label="Active" name="isActive" defaultChecked={r.isActive ?? true} /></div>
    </div>
  );
}

function Status({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <li className="flex gap-3 py-2.5">
      {ok ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <XCircle className="h-5 w-5 shrink-0 text-danger" />}
      <span><span className="font-medium">{label}</span><span className="block text-xs text-muted">{detail}</span></span>
    </li>
  );
}

export default async function AdminSettings() {
  const [settings, rates] = await Promise.all([getStoreSettings(), db.shippingRate.findMany({ orderBy: { sortOrder: "asc" } })]);
  const s = integrationStatus();
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" />
      <Card title="Integrations">
        <ul className="divide-y divide-line text-sm">
          <Status ok={s.stripe} label={`Stripe payments${s.stripe ? ` (${s.stripeMode} mode)` : ""}`} detail="STRIPE_SECRET_KEY — enable payment methods (cards, PayPal, Klarna, SEPA…) in the Stripe Dashboard." />
          <Status ok={s.stripeWebhook} label="Stripe webhook" detail="STRIPE_WEBHOOK_SECRET — endpoint /api/webhooks/stripe. Orders are only marked paid via this webhook." />
          <Status ok={s.email} label="Transactional email (Resend)" detail="RESEND_API_KEY and EMAIL_FROM (verified sending domain)." />
          <Status ok={s.imageStorage} label="Image storage (Cloudinary)" detail="CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET — required for uploads in production." />
          <Status ok={s.analytics} label="Analytics (optional)" detail="NEXT_PUBLIC_PLAUSIBLE_DOMAIN — loads only after visitor consent." />
        </ul>
        <p className="mt-3 text-xs text-muted">Secrets are configured as environment variables on your host (never in the database). Currency: EUR. {settings.smallBusiness ? "Small-business rule: no VAT is charged." : "Prices include VAT."}</p>
      </Card>

      <Card title="Store information">
        <ActionForm action={saveStoreSettings}>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Store name" name="storeName" defaultValue={settings.storeName} />
            <F label="Default VAT rate (%)" name="defaultVatRate" type="number" defaultValue={settings.defaultVatRate} hint="Applied to shipping costs (ignored under the small-business rule)" />
            <div className="sm:col-span-2"><Check label="Small-business rule (Kleinunternehmer, § 19 UStG): do not charge or show VAT" name="smallBusiness" defaultChecked={settings.smallBusiness} /></div>
            <F label="Tagline (footer)" name="tagline" defaultValue={settings.tagline} className="sm:col-span-2" />
            <F label="Contact email (shown on contact page, receives form messages)" name="contactEmail" type="email" defaultValue={settings.contactEmail} />
            <F label="Contact phone" name="contactPhone" defaultValue={settings.contactPhone} />
            <F label="Instagram URL" name="instagramUrl" type="url" defaultValue={settings.instagramUrl} placeholder="https://" />
            <F label="Facebook URL" name="facebookUrl" type="url" defaultValue={settings.facebookUrl} placeholder="https://" />
            <F label="TikTok URL" name="tiktokUrl" type="url" defaultValue={settings.tiktokUrl} placeholder="https://" />
            <F label="Pinterest URL" name="pinterestUrl" type="url" defaultValue={settings.pinterestUrl} placeholder="https://" />
          </div>
        </ActionForm>
      </Card>

      <h2 className="pt-4 text-lg font-semibold">Shipping rates</h2>
      <p className="-mt-4 text-sm text-muted">All shipping costs come from this table — they are not hard-coded anywhere in the store.</p>
      {rates.map((r) => (
        <Card key={r.id}>
          <details>
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
              <span className="font-medium">{r.name}</span>
              <span className="text-sm text-muted">{r.countries.join(", ")} · {formatPrice(r.price)}{r.freeOver ? ` · free from ${formatPrice(r.freeOver)}` : ""} · {r.minDays}–{r.maxDays} days{r.isActive ? "" : " · inactive"}</span>
              <span className="text-sm text-bronze-deep">Edit</span>
            </summary>
            <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
              <ActionForm action={saveShippingRate}><RateFields r={r} /></ActionForm>
              <ActionForm action={deleteShippingRate} submitLabel="Delete" variant="ghost" confirm="Delete this shipping rate?"><input type="hidden" name="id" value={r.id} /></ActionForm>
            </div>
          </details>
        </Card>
      ))}
      <Card title="New shipping rate"><ActionForm action={saveShippingRate} submitLabel="Add rate" resetOnSuccess><RateFields r={{}} /></ActionForm></Card>
    </div>
  );
}
