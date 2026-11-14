"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { LinkButton } from "@/components/ui/button";
import { useCart, useUI } from "@/components/providers/store-providers";
import { formatPrice } from "@/lib/money";
import { SMALL_BUSINESS_NOTE } from "@/components/ui/vat-note";
import { FALLBACK_IMAGE } from "@/lib/site";
import type { CartLine } from "@/lib/cart";

export function LineIssue({ line }: { line: CartLine }) {
  if (!line.issue) return null;
  const text =
    line.issue === "unavailable"
      ? "No longer available — please remove"
      : line.issue === "out_of_stock"
        ? "Out of stock — please remove"
        : `Only ${line.stock} available — quantity reduced`;
  return <p className="mt-1 text-xs font-medium text-danger">{text}</p>;
}

export function QuantityStepper({ line, size = "sm" }: { line: CartLine; size?: "sm" | "md" }) {
  const { setQuantity } = useCart();
  const { notify } = useUI();
  const [busy, setBusy] = useState(false);
  const change = async (q: number) => {
    setBusy(true);
    const r = await setQuantity(line.variantId, q);
    setBusy(false);
    if (!r.ok) notify(r.error, "error");
  };
  const h = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center rounded-full border border-line bg-white" role="group" aria-label={`Quantity for ${line.name}`}>
        <button type="button" className={`${h} flex items-center justify-center rounded-l-full hover:bg-cream disabled:opacity-40`} onClick={() => change(line.quantity - 1)} disabled={busy || line.issue === "unavailable"} aria-label="Decrease quantity">
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-7 text-center text-sm tabular-nums">{line.quantity}</span>
        <button type="button" className={`${h} flex items-center justify-center rounded-r-full hover:bg-cream disabled:opacity-40`} onClick={() => change(line.quantity + 1)} disabled={busy || line.quantity >= line.stock || line.issue !== null} aria-label="Increase quantity">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <button type="button" onClick={() => change(0)} disabled={busy} className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-cream hover:text-danger" aria-label={`Remove ${line.name}`}>
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function FreeShippingProgress({ merchandise, threshold }: { merchandise: number; threshold: number | null }) {
  if (!threshold) return null;
  const remaining = threshold - merchandise;
  const pct = Math.min(100, Math.round((merchandise / threshold) * 100));
  return (
    <div className="rounded-xl bg-white p-3.5">
      <p className="flex items-center gap-2 text-xs text-ink-soft">
        <Truck className="h-4 w-4 text-bronze-deep" aria-hidden />
        {remaining > 0 ? (
          <>
            Add <strong className="font-semibold text-ink">{formatPrice(remaining)}</strong> for free standard shipping
          </>
        ) : (
          <>You&apos;ve unlocked free standard shipping</>
        )}
      </p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-sand" aria-hidden>
        <div className="h-full rounded-full bg-bronze transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { cart, drawerOpen, closeDrawer } = useCart();
  const lines = cart?.lines ?? [];

  return (
    <Modal open={drawerOpen} onClose={closeDrawer} title={`Your bag${cart?.count ? ` (${cart.count})` : ""}`} side="right">
      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream">
            <ShoppingBag className="h-7 w-7 text-bronze-deep" aria-hidden />
          </span>
          <p className="mt-5 font-display text-lg font-medium">Your bag is empty</p>
          <p className="mt-1 text-sm text-muted">Discover new arrivals and our best sellers.</p>
          <LinkButton href="/shop" className="mt-6" onClick={closeDrawer}>
            Start shopping
          </LinkButton>
        </div>
      ) : (
        <>
          <div className="px-5 pt-4 sm:px-6">
            <FreeShippingProgress merchandise={(cart?.subtotal ?? 0) - (cart?.discount ?? 0)} threshold={cart?.shippingOption?.freeOver ?? null} />
          </div>
          <ul className="flex-1 divide-y divide-line overflow-y-auto px-5 sm:px-6">
            {lines.map((line) => (
              <li key={line.id} className="flex gap-4 py-5">
                <Link href={`/product/${line.slug}`} onClick={closeDrawer} className="relative h-28 w-22 shrink-0 overflow-hidden rounded-xl bg-cream">
                  <Image src={line.image ?? FALLBACK_IMAGE} alt={line.imageAlt} fill sizes="88px" className="object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <Link href={`/product/${line.slug}`} onClick={closeDrawer} className="text-sm font-medium leading-snug hover:text-bronze-deep">
                      {line.name}
                    </Link>
                    <span className="text-sm font-medium tabular-nums">{formatPrice(line.lineTotal)}</span>
                  </div>
                  {line.variantLabel && <p className="mt-0.5 text-xs text-muted">{line.variantLabel}</p>}
                  <p className="mt-0.5 text-xs text-muted">{formatPrice(line.unitPrice)} each</p>
                  <LineIssue line={line} />
                  <div className="mt-auto pt-3">
                    <QuantityStepper line={line} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-line bg-white px-5 py-5 sm:px-6">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(cart!.subtotal)}</dd>
              </div>
              {cart!.discount > 0 && (
                <div className="flex justify-between text-success">
                  <dt>Discount ({cart!.couponCode})</dt>
                  <dd className="tabular-nums">−{formatPrice(cart!.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="tabular-nums">{cart!.shipping === 0 ? "Free" : formatPrice(cart!.shipping)}</dd>
              </div>
            </dl>
            <p className="mt-1 text-xs text-muted">{cart!.tax > 0 ? "Incl. VAT." : SMALL_BUSINESS_NOTE} Shipping shown for Germany; final cost confirmed at checkout.</p>
            <div className="mt-4 grid gap-2">
              <LinkButton href="/checkout" size="lg" className="h-12" onClick={closeDrawer} aria-disabled={cart!.hasIssues}>
                Checkout · {formatPrice(cart!.total)}
              </LinkButton>
              <LinkButton href="/cart" variant="outline" onClick={closeDrawer}>
                View bag
              </LinkButton>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
