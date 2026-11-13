import { ActionForm, Card, Check, F, PageHeader } from "@/components/admin/ui";
import { deleteCoupon, saveCoupon } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { centsToEuroInput, formatPrice } from "@/lib/money";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Promotions" };

type C = { id?: string; code?: string; description?: string | null; type?: string; value?: number; minOrderValue?: number | null; startsAt?: Date | null; expiresAt?: Date | null; usageLimit?: number | null; isActive?: boolean };
const dt = (d?: Date | null) => (d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

function CouponFields({ c }: { c: C }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {c.id && <input type="hidden" name="id" value={c.id} />}
      <F label="Code" name="code" defaultValue={c.code} required className="uppercase" />
      <div>
        <label className="label" htmlFor={`type-${c.id ?? "new"}`}>Type</label>
        <select id={`type-${c.id ?? "new"}`} name="type" defaultValue={c.type ?? "PERCENTAGE"} className="field h-11"><option value="PERCENTAGE">Percentage (%)</option><option value="FIXED">Fixed amount (€)</option></select>
      </div>
      <F label="Value" name="value" defaultValue={c.type === "FIXED" ? centsToEuroInput(c.value) : c.value} required hint="10 = 10% or 10,00 €" />
      <F label="Minimum order (€)" name="minOrderValue" defaultValue={centsToEuroInput(c.minOrderValue)} />
      <F label="Starts" name="startsAt" type="datetime-local" defaultValue={dt(c.startsAt)} />
      <F label="Expires" name="expiresAt" type="datetime-local" defaultValue={dt(c.expiresAt)} />
      <F label="Usage limit" name="usageLimit" type="number" defaultValue={c.usageLimit ?? ""} hint="Empty = unlimited" />
      <F label="Internal description" name="description" defaultValue={c.description} className="sm:col-span-2" />
      <div className="sm:col-span-3"><Check label="Active" name="isActive" defaultChecked={c.isActive ?? true} /></div>
    </div>
  );
}

export default async function AdminPromotions() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <PageHeader title="Promotions" description="Discount codes customers can enter in the bag. Usage is counted when an order is paid." />
      {coupons.map((c) => (
        <Card key={c.id}>
          <details>
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
              <span className="font-mono font-semibold">{c.code}</span>
              <span className="text-sm text-muted">{c.type === "PERCENTAGE" ? `${c.value}% off` : `${formatPrice(c.value)} off`}{c.minOrderValue ? ` · min ${formatPrice(c.minOrderValue)}` : ""} · used {c.usageCount}{c.usageLimit ? `/${c.usageLimit}` : ""}{c.expiresAt ? ` · until ${formatDate(c.expiresAt)}` : ""}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs ${c.isActive ? "bg-success/10 text-success" : "bg-sand text-muted"}`}>{c.isActive ? "Active" : "Inactive"}</span>
            </summary>
            <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
              <ActionForm action={saveCoupon}><CouponFields c={c} /></ActionForm>
              <ActionForm action={deleteCoupon} submitLabel="Delete" variant="ghost" confirm={`Delete code ${c.code}?`}><input type="hidden" name="id" value={c.id} /></ActionForm>
            </div>
          </details>
        </Card>
      ))}
      <Card title="New promotion"><ActionForm action={saveCoupon} submitLabel="Create code" resetOnSuccess><CouponFields c={{}} /></ActionForm></Card>
    </div>
  );
}
