"use client";

import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { saveProduct, type ProductInput } from "@/app/admin/actions";
import { Card, uploadFile } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { centsToEuroInput, parseEuroToCents } from "@/lib/money";
import { slugify } from "@/lib/validation";

type Variant = { id?: string; sku: string; size: string; color: string; colorHex: string; price: string; stock: string; isActive: boolean };
type Img = { url: string; alt: string };

export type ProductEditorInitial = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  details: string;
  careInfo: string;
  price: number | null;
  compareAtPrice: number | null;
  vatRate: number;
  categoryId: string | null;
  collectionIds: string[];
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  isFeatured: boolean;
  isBestSeller: boolean;
  badge: string;
  images: Img[];
  variants: { id?: string; sku: string; size: string | null; color: string | null; colorHex: string | null; price: number | null; stock: number; isActive: boolean }[];
};

export function ProductEditor({ initial, categories, collections }: { initial: ProductEditorInitial; categories: { id: string; name: string }[]; collections: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [f, setF] = useState({
    name: initial.name,
    slug: initial.slug,
    description: initial.description,
    details: initial.details,
    careInfo: initial.careInfo,
    price: centsToEuroInput(initial.price),
    compareAtPrice: centsToEuroInput(initial.compareAtPrice),
    vatRate: String(initial.vatRate),
    categoryId: initial.categoryId ?? "",
    status: initial.status,
    isFeatured: initial.isFeatured,
    isBestSeller: initial.isBestSeller,
    badge: initial.badge,
  });
  const [collectionIds, setCollectionIds] = useState<string[]>(initial.collectionIds);
  const [images, setImages] = useState<Img[]>(initial.images);
  const [variants, setVariants] = useState<Variant[]>(
    initial.variants.length
      ? initial.variants.map((v) => ({ id: v.id, sku: v.sku, size: v.size ?? "", color: v.color ?? "", colorHex: v.colorHex ?? "", price: centsToEuroInput(v.price), stock: String(v.stock), isActive: v.isActive }))
      : [{ sku: "", size: "", color: "", colorHex: "", price: "", stock: "0", isActive: true }],
  );
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value });

  const setVariant = (i: number, patch: Partial<Variant>) => setVariants((vs) => vs.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  const moveImage = (i: number, d: number) =>
    setImages((imgs) => {
      const next = [...imgs];
      const [x] = next.splice(i, 1);
      next.splice(Math.max(0, Math.min(next.length, i + d)), 0, x);
      return next;
    });

  const generateSkus = () => {
    const base = slugify(f.slug || f.name).toUpperCase().slice(0, 14) || "SKU";
    setVariants((vs) => vs.map((v) => (v.sku ? v : { ...v, sku: [base, v.color, v.size].filter(Boolean).join("-").toUpperCase().replace(/\s+/g, "") })));
  };

  const submit = () => {
    setMessage(null);
    const price = parseEuroToCents(f.price);
    if (price === null) return setMessage({ tone: "error", text: "Enter a valid price (e.g. 49,90)." });
    const payload: ProductInput = {
      id: initial.id,
      name: f.name,
      slug: f.slug,
      description: f.description,
      details: f.details || null,
      careInfo: f.careInfo || null,
      price,
      compareAtPrice: parseEuroToCents(f.compareAtPrice),
      vatRate: Number(f.vatRate) || 0,
      categoryId: f.categoryId || null,
      collectionIds,
      status: f.status,
      isFeatured: f.isFeatured,
      isBestSeller: f.isBestSeller,
      badge: f.badge || null,
      images,
      variants: variants.map((v) => ({ id: v.id, sku: v.sku, size: v.size || null, color: v.color || null, colorHex: v.colorHex || null, price: parseEuroToCents(v.price), stock: Number.parseInt(v.stock, 10) || 0, isActive: v.isActive })),
    };
    startTransition(async () => {
      const r = await saveProduct(payload);
      setMessage({ tone: r.status === "success" ? "success" : "error", text: r.message });
      if (r.status === "success" && r.id && !initial.id) router.replace(`/admin/products/${r.id}`);
      else router.refresh();
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <Card title="Details">
          <div className="grid gap-4">
            <div><label className="label" htmlFor="p-name">Name</label><input id="p-name" className="field h-11" value={f.name} onChange={set("name")} required /></div>
            <div><label className="label" htmlFor="p-slug">URL slug</label><input id="p-slug" className="field h-11" value={f.slug} onChange={set("slug")} placeholder={slugify(f.name)} /><p className="mt-1 text-xs text-muted">/product/{slugify(f.slug || f.name) || "…"}</p></div>
            <div><label className="label" htmlFor="p-desc">Description</label><textarea id="p-desc" className="field" rows={5} value={f.description} onChange={set("description")} /></div>
            <div><label className="label" htmlFor="p-details">Specifications</label><textarea id="p-details" className="field font-mono text-xs" rows={4} value={f.details} onChange={set("details")} placeholder={"Material: 100% cotton\nFit: Regular"} /><p className="mt-1 text-xs text-muted">One per line, as “Label: value”.</p></div>
            <div><label className="label" htmlFor="p-care">Care instructions</label><textarea id="p-care" className="field" rows={2} value={f.careInfo} onChange={set("careInfo")} /></div>
          </div>
        </Card>

        <Card title="Images" actions={
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-1.5 text-sm hover:border-ink/40">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} Upload
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" onChange={async (e) => {
              const files = [...(e.target.files ?? [])];
              setUploading(true);
              try {
                for (const file of files) {
                  const url = await uploadFile(file, "products");
                  setImages((imgs) => [...imgs, { url, alt: f.name }]);
                }
              } catch (err) {
                setMessage({ tone: "error", text: (err as Error).message });
              } finally {
                setUploading(false);
                e.target.value = "";
              }
            }} />
          </label>
        }>
          {images.length === 0 && <p className="text-sm text-muted">No images yet. The first image is used on product cards.</p>}
          <ul className="space-y-3">
            {images.map((img, i) => (
              <li key={img.url + i} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-16 w-13 shrink-0 rounded-lg bg-cream object-cover" />
                <input className="field h-9 flex-1 text-xs" value={img.alt} onChange={(e) => setImages((imgs) => imgs.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} placeholder="Alt text (describe the image)" aria-label={`Alt text for image ${i + 1}`} />
                <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="rounded-full p-2 hover:bg-cream disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} className="rounded-full p-2 hover:bg-cream disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))} className="rounded-full p-2 text-danger hover:bg-cream" aria-label="Remove image"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Variants & stock" actions={<button type="button" onClick={generateSkus} className="text-xs text-bronze-deep hover:underline">Generate missing SKUs</button>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-xs text-muted"><tr><th className="pb-2 font-medium">SKU</th><th className="pb-2 font-medium">Size</th><th className="pb-2 font-medium">Colour</th><th className="pb-2 font-medium">Hex</th><th className="pb-2 font-medium">Price override €</th><th className="pb-2 font-medium">Stock</th><th className="pb-2 font-medium">Active</th><th /></tr></thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={v.id ?? `new-${i}`}>
                    <td className="py-1 pr-2"><input className="field h-9 text-xs uppercase" value={v.sku} onChange={(e) => setVariant(i, { sku: e.target.value })} aria-label="SKU" /></td>
                    <td className="py-1 pr-2"><input className="field h-9 w-20 text-xs" value={v.size} onChange={(e) => setVariant(i, { size: e.target.value })} aria-label="Size" /></td>
                    <td className="py-1 pr-2"><input className="field h-9 w-28 text-xs" value={v.color} onChange={(e) => setVariant(i, { color: e.target.value })} aria-label="Colour" /></td>
                    <td className="py-1 pr-2"><div className="flex items-center gap-1"><input type="color" value={v.colorHex || "#e9e1d5"} onChange={(e) => setVariant(i, { colorHex: e.target.value })} className="h-9 w-9 rounded border border-line" aria-label="Colour swatch" />{v.colorHex && <button type="button" className="text-[10px] text-muted" onClick={() => setVariant(i, { colorHex: "" })}>clear</button>}</div></td>
                    <td className="py-1 pr-2"><input className="field h-9 w-24 text-xs" value={v.price} onChange={(e) => setVariant(i, { price: e.target.value })} placeholder="—" inputMode="decimal" aria-label="Price override" /></td>
                    <td className="py-1 pr-2"><input className="field h-9 w-20 text-xs" type="number" min={0} value={v.stock} onChange={(e) => setVariant(i, { stock: e.target.value })} aria-label="Stock" /></td>
                    <td className="py-1 pr-2 text-center"><input type="checkbox" checked={v.isActive} onChange={(e) => setVariant(i, { isActive: e.target.checked })} className="h-4 w-4 accent-[#1f1d1b]" aria-label="Active" /></td>
                    <td className="py-1"><button type="button" onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))} disabled={variants.length === 1} className="rounded-full p-2 text-danger hover:bg-cream disabled:opacity-30" aria-label="Remove variant"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={() => setVariants((vs) => [...vs, { sku: "", size: "", color: vs[vs.length - 1]?.color ?? "", colorHex: vs[vs.length - 1]?.colorHex ?? "", price: "", stock: "0", isActive: true }])} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-bronze-deep hover:underline"><Plus className="h-4 w-4" /> Add variant</button>
          <p className="mt-2 text-xs text-muted">Stock changes are recorded in the inventory log. Variants that appear in past orders are deactivated instead of deleted.</p>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Status">
          <select className="field h-11" value={f.status} onChange={set("status")} aria-label="Status">
            <option value="DRAFT">Draft — hidden</option><option value="ACTIVE">Active — visible in store</option><option value="ARCHIVED">Archived</option>
          </select>
          <div className="mt-4 space-y-2.5 text-sm">
            <label className="flex items-center gap-2.5"><input type="checkbox" checked={f.isFeatured} onChange={set("isFeatured")} className="h-4 w-4 accent-[#1f1d1b]" /> Featured (ranks first in “Featured” sort)</label>
            <label className="flex items-center gap-2.5"><input type="checkbox" checked={f.isBestSeller} onChange={set("isBestSeller")} className="h-4 w-4 accent-[#1f1d1b]" /> Show in homepage Best Sellers</label>
          </div>
          <div className="mt-4"><label className="label" htmlFor="p-badge">Badge</label><input id="p-badge" className="field h-11" value={f.badge} onChange={set("badge")} placeholder="e.g. New, Limited" maxLength={24} /></div>
        </Card>
        <Card title="Pricing">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label" htmlFor="p-price">Price (€)</label><input id="p-price" className="field h-11" value={f.price} onChange={set("price")} inputMode="decimal" placeholder="49,90" /></div>
            <div><label className="label" htmlFor="p-compare">Original price (€)</label><input id="p-compare" className="field h-11" value={f.compareAtPrice} onChange={set("compareAtPrice")} inputMode="decimal" placeholder="optional" /></div>
            <div><label className="label" htmlFor="p-vat">VAT %</label><input id="p-vat" className="field h-11" type="number" min={0} max={30} value={f.vatRate} onChange={set("vatRate")} /></div>
          </div>
          <p className="mt-2 text-xs text-muted">Prices are gross (incl. VAT). Setting an original price marks the product as on sale.</p>
        </Card>
        <Card title="Organisation">
          <label className="label" htmlFor="p-cat">Category</label>
          <select id="p-cat" className="field h-11" value={f.categoryId} onChange={set("categoryId")}>
            <option value="">— None —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <p className="label mt-4">Collections</p>
          <div className="space-y-2">
            {collections.map((c) => (
              <label key={c.id} className="flex items-center gap-2.5 text-sm">
                <input type="checkbox" checked={collectionIds.includes(c.id)} onChange={(e) => setCollectionIds((ids) => (e.target.checked ? [...ids, c.id] : ids.filter((x) => x !== c.id)))} className="h-4 w-4 accent-[#1f1d1b]" /> {c.name}
              </label>
            ))}
          </div>
        </Card>
        <div className="sticky bottom-4 space-y-3 rounded-2xl border border-line bg-white p-4 shadow-soft">
          {message && <p className={`text-sm ${message.tone === "success" ? "text-success" : "text-danger"}`} role={message.tone === "error" ? "alert" : "status"}>{message.text}</p>}
          <Button className="w-full" size="lg" onClick={submit} loading={pending || uploading}>{initial.id ? "Save changes" : "Create product"}</Button>
        </div>
      </div>
    </div>
  );
}
