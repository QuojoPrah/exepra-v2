"use client";

import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { useCart, useUI, useWishlist } from "@/components/providers/store-providers";
import { cn } from "@/lib/utils";

export type PurchaseVariant = {
  id: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  price: number | null;
  stock: number;
};

export function PurchasePanel({
  productId,
  basePrice,
  compareAtPrice,
  variants,
  compact = false,
  onAdded,
}: {
  productId: string;
  basePrice: number;
  compareAtPrice: number | null;
  variants: PurchaseVariant[];
  compact?: boolean;
  onAdded?: () => void;
}) {
  const router = useRouter();
  const cart = useCart();
  const wishlist = useWishlist();
  const { notify } = useUI();

  const colors = useMemo(() => {
    const m = new Map<string, string | null>();
    variants.forEach((v) => v.color && m.set(v.color, v.colorHex));
    return [...m].map(([name, hex]) => ({ name, hex }));
  }, [variants]);
  const sizes = useMemo(() => [...new Set(variants.map((v) => v.size).filter(Boolean) as string[])], [variants]);

  const firstInStock = variants.find((v) => v.stock > 0) ?? variants[0];
  const [color, setColor] = useState<string | null>(colors.length ? (firstInStock?.color ?? colors[0].name) : null);
  const [size, setSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"add" | "buy" | null>(null);
  const [added, setAdded] = useState(false);

  const selected = variants.find((v) => (colors.length ? v.color === color : true) && (sizes.length ? v.size === size : true)) ?? null;
  const needsSize = sizes.length > 0 && !size;
  const price = selected?.price ?? basePrice;
  const stock = selected?.stock ?? 0;
  const saved = wishlist.has(productId);

  const sizeAvailable = (s: string) => variants.some((v) => v.size === s && (colors.length ? v.color === color : true) && v.stock > 0);
  const colorAvailable = (c: string) => variants.some((v) => v.color === c && v.stock > 0);

  const submit = async (mode: "add" | "buy") => {
    setError(null);
    if (needsSize) return setError("Please select a size.");
    if (!selected) return setError("This combination is not available.");
    if (selected.stock <= 0) return setError("This option is out of stock.");
    setBusy(mode);
    const result = await cart.add(selected.id, quantity, { openDrawer: mode === "add" });
    setBusy(null);
    if (!result.ok) return setError(result.error);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
    onAdded?.();
    if (mode === "buy") router.push("/checkout");
  };

  return (
    <div className="space-y-6">
      <Price price={price} compareAt={compareAtPrice} size="lg" showDiscount />

      {colors.length > 0 && (
        <fieldset>
          <legend className="mb-2.5 text-sm">
            <span className="font-medium">Colour:</span> <span className="text-muted">{color ?? "Select"}</span>
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((c) => {
              const available = colorAvailable(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setColor(c.name);
                    setError(null);
                  }}
                  aria-pressed={color === c.name}
                  aria-label={`${c.name}${available ? "" : " (out of stock)"}`}
                  title={c.name}
                  className={cn(
                    "relative h-9 w-9 rounded-full border transition",
                    color === c.name ? "ring-2 ring-ink ring-offset-2 ring-offset-ivory" : "border-line hover:border-ink/40",
                    !available && "opacity-40",
                  )}
                  style={{ backgroundColor: c.hex ?? "#e9e1d5" }}
                >
                  {!available && <span className="absolute left-1/2 top-1/2 h-px w-10 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-ink/50" aria-hidden />}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {sizes.length > 0 && (
        <fieldset>
          <legend className="mb-2.5 text-sm font-medium">Size</legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const available = sizeAvailable(s);
              return (
                <button
                  key={s}
                  type="button"
                  disabled={!available}
                  onClick={() => {
                    setSize(s);
                    setError(null);
                  }}
                  aria-pressed={size === s}
                  className={cn(
                    "h-11 min-w-12 rounded-full border px-4 text-sm font-medium transition",
                    size === s ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40",
                    !available && "cursor-not-allowed text-taupe line-through hover:border-line",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="text-sm" aria-live="polite">
        {selected && !needsSize ? (
          stock > 0 ? (
            <span className="flex items-center gap-2 text-success">
              <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
              {stock <= 5 ? `Only ${stock} left in stock` : "In stock — ready to ship"}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-danger">
              <span className="h-2 w-2 rounded-full bg-danger" aria-hidden />
              Out of stock
            </span>
          )
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-12 items-center rounded-full border border-line bg-white" role="group" aria-label="Quantity">
          <button type="button" className="flex h-12 w-11 items-center justify-center rounded-l-full hover:bg-cream disabled:opacity-40" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">
            {quantity}
          </span>
          <button type="button" className="flex h-12 w-11 items-center justify-center rounded-r-full hover:bg-cream disabled:opacity-40" onClick={() => setQuantity((q) => Math.min(Math.max(stock, 1), 99, q + 1))} disabled={!selected || quantity >= stock} aria-label="Increase quantity">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button size="lg" className="h-12 flex-1" onClick={() => submit("add")} loading={busy === "add"} disabled={busy !== null || (selected !== null && stock <= 0)}>
          {added ? (
            <>
              <Check className="h-4 w-4" /> Added to bag
            </>
          ) : selected && !needsSize && stock <= 0 ? (
            "Out of stock"
          ) : (
            "Add to bag"
          )}
        </Button>
        <button
          type="button"
          onClick={async () => {
            const r = await wishlist.toggle(productId);
            if (!r.ok) notify(r.error, "error");
          }}
          aria-pressed={saved}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          className={cn("flex h-12 w-12 items-center justify-center rounded-full border transition", saved ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40")}
        >
          <Heart className="h-5 w-5" fill={saved ? "currentColor" : "none"} strokeWidth={1.7} />
        </button>
      </div>
      {!compact && (
        <Button variant="outline" size="lg" className="h-12 w-full" onClick={() => submit("buy")} loading={busy === "buy"} disabled={busy !== null || (selected !== null && stock <= 0)}>
          Buy now
        </Button>
      )}
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
