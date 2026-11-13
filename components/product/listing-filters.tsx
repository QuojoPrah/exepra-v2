"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Facets = { sizes: string[]; colors: { name: string; hex: string | null }[]; minPrice: number; maxPrice: number };

export function ListingFilters({
  total,
  facets,
  categories,
  sortOptions,
}: {
  total: number;
  facets: Facets;
  categories: { slug: string; name: string }[];
  sortOptions: { value: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const getList = (key: string) => params.get(key)?.split(",").filter(Boolean) ?? [];
  const sizes = getList("size");
  const colors = getList("color");
  const category = params.get("category") ?? "";
  const inStock = params.get("stock") === "1";
  const sort = params.get("sort") ?? "featured";

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    next.delete("page");
    const qs = next.toString();
    startTransition(() => router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false }));
  };

  const toggleIn = (key: "size" | "color", value: string) => {
    const current = key === "size" ? sizes : colors;
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    update({ [key]: next.join(",") || null });
  };

  const activeChips = [
    ...(category ? [{ label: categories.find((c) => c.slug === category)?.name ?? category, clear: () => update({ category: null }) }] : []),
    ...sizes.map((s) => ({ label: `Size ${s}`, clear: () => toggleIn("size", s) })),
    ...colors.map((c) => ({ label: c, clear: () => toggleIn("color", c) })),
    ...(params.get("min") || params.get("max")
      ? [{ label: `${params.get("min") || 0} € – ${params.get("max") || "∞"} €`, clear: () => update({ min: null, max: null }) }]
      : []),
    ...(inStock ? [{ label: "In stock", clear: () => update({ stock: null }) }] : []),
  ];

  const panel = (
    <div className="space-y-8">
      {categories.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Category</legend>
          <div className="flex flex-wrap gap-2">
            {[{ slug: "", name: "All" }, ...categories].map((c) => (
              <button
                key={c.slug}
                type="button"
                aria-pressed={category === c.slug}
                onClick={() => update({ category: c.slug || null })}
                className={cn("rounded-full border px-4 py-2 text-sm", category === c.slug ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40")}
              >
                {c.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {facets.sizes.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Size</legend>
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={sizes.includes(s)}
                onClick={() => toggleIn("size", s)}
                className={cn("h-10 min-w-12 rounded-full border px-3 text-sm", sizes.includes(s) ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40")}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {facets.colors.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Colour</legend>
          <div className="flex flex-wrap gap-2">
            {facets.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                aria-pressed={colors.includes(c.name)}
                onClick={() => toggleIn("color", c.name)}
                className={cn("flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-sm", colors.includes(c.name) ? "border-ink bg-white ring-1 ring-ink" : "border-line bg-white hover:border-ink/40")}
              >
                <span className="h-6 w-6 rounded-full border border-black/10" style={{ backgroundColor: c.hex ?? "#e9e1d5" }} aria-hidden />
                {c.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Price (€)</legend>
        <form
          key={`${params.get("min")}-${params.get("max")}`}
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const clean = (v: FormDataEntryValue | null) => String(v ?? "").replace(",", ".").replace(/[^\d.]/g, "") || null;
            update({ min: clean(fd.get("min")), max: clean(fd.get("max")) });
          }}
        >
          <label className="flex-1">
            <span className="sr-only">Minimum price</span>
            <input name="min" className="field h-10" inputMode="decimal" placeholder={`Min ${Math.floor(facets.minPrice / 100)}`} defaultValue={params.get("min") ?? ""} />
          </label>
          <span className="pb-2 text-muted">–</span>
          <label className="flex-1">
            <span className="sr-only">Maximum price</span>
            <input name="max" className="field h-10" inputMode="decimal" placeholder={`Max ${Math.ceil(facets.maxPrice / 100)}`} defaultValue={params.get("max") ?? ""} />
          </label>
          <Button type="submit" size="sm" variant="outline" className="h-10">
            Apply
          </Button>
        </form>
      </fieldset>

      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" checked={inStock} onChange={(e) => update({ stock: e.target.checked ? "1" : null })} className="h-4 w-4 accent-[#1f1d1b]" />
        Only show items in stock
      </label>
    </div>
  );

  return (
    <div className={cn("transition-opacity", pending && "opacity-60")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setOpen(true)} aria-haspopup="dialog">
            <SlidersHorizontal className="h-4 w-4" /> Filters {activeChips.length > 0 && `(${activeChips.length})`}
          </Button>
          <p className="text-sm text-muted" aria-live="polite">
            {total} {total === 1 ? "product" : "products"}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Sort by</span>
          <select className="field h-9 w-auto rounded-full py-0 pl-4 text-sm" value={sort} onChange={(e) => update({ sort: e.target.value === "featured" ? null : e.target.value })}>
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {activeChips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button key={chip.label} type="button" onClick={chip.clear} className="flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-xs font-medium hover:bg-sand" aria-label={`Remove filter ${chip.label}`}>
              {chip.label} <X className="h-3 w-3" aria-hidden />
            </button>
          ))}
          <button type="button" onClick={() => startTransition(() => router.push(`${pathname}${params.get("q") ? `?q=${encodeURIComponent(params.get("q")!)}` : ""}`, { scroll: false }))} className="text-xs font-medium text-bronze-deep underline-offset-2 hover:underline">
            Clear all
          </button>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Filters" side="right">
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">{panel}</div>
        <div className="border-t border-line bg-white p-5">
          <Button className="w-full" size="lg" onClick={() => setOpen(false)}>
            Show {total} {total === 1 ? "product" : "products"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
