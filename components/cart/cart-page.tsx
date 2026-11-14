"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, Lock, ShoppingBag, Tag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/providers/store-providers";
import { Button, LinkButton } from "@/components/ui/button";
import { FreeShippingProgress, LineIssue, QuantityStepper } from "@/components/cart/cart-drawer";
import { formatPrice } from "@/lib/money";
import { vatNote } from "@/components/ui/vat-note";
import { FALLBACK_IMAGE } from "@/lib/site";

export function OrderSummary({ showCoupon = true }: { showCoupon?: boolean }) {
  const { cart, applyCoupon } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!cart) return null;

  const submitCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    const r = await applyCoupon(code.trim());
    setBusy(false);
    if (!r.ok) setError(r.error);
    else setCode("");
  };

  return (
    <div className="space-y-5">
      {showCoupon && (
        <div>
          {cart.couponCode ? (
            <div className="flex items-center justify-between rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
              <span className="flex items-center gap-2 font-medium">
                <Tag className="h-4 w-4" aria-hidden /> {cart.couponCode} applied
              </span>
              <button type="button" onClick={() => applyCoupon(null)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-success/10" aria-label="Remove promo code">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={submitCoupon} className="flex gap-2">
              <label htmlFor="promo" className="sr-only">
                Promo code
              </label>
              <input id="promo" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Promo code" className="field h-11 flex-1 uppercase" autoComplete="off" aria-invalid={Boolean(error) || undefined} aria-describedby="promo-error" />
              <Button type="submit" variant="outline" className="h-11" loading={busy}>
                Apply
              </Button>
            </form>
          )}
          {(error || cart.couponError) && (
            <p id="promo-error" className="field-error" role="alert">
              {error ?? cart.couponError}
            </p>
          )}
        </div>
      )}
      <dl className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(cart.subtotal)}</dd>
        </div>
        {cart.discount > 0 && (
          <div className="flex justify-between text-success">
            <dt>Discount</dt>
            <dd className="tabular-nums">−{formatPrice(cart.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted">Shipping {cart.shippingOption ? `(${cart.shippingOption.name}, DE)` : ""}</dt>
          <dd className="tabular-nums">{cart.shipping === 0 ? "Free" : formatPrice(cart.shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatPrice(cart.total)}</dd>
        </div>
        <p className="text-xs text-muted">{vatNote(cart.tax)} Final shipping is calculated for your address at checkout.</p>
      </dl>
    </div>
  );
}

export function CartPageClient() {
  const { cart, loading } = useCart();

  if (loading && !cart) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" aria-label="Loading your bag" />
      </div>
    );
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-cream">
          <ShoppingBag className="h-8 w-8 text-bronze-deep" aria-hidden />
        </span>
        <h1 className="mt-6 text-3xl font-semibold">Your bag is empty</h1>
        <p className="mt-2 max-w-sm text-muted">Looks like you haven&apos;t added anything yet. Let&apos;s change that.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href="/new-arrivals" variant="outline">
            New arrivals
          </LinkButton>
          <LinkButton href="/shop">Start shopping</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="text-3xl font-semibold sm:text-4xl">Your bag</h1>
      <p className="mt-2 text-sm text-muted">
        {cart.count} {cart.count === 1 ? "item" : "items"}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div>
          <FreeShippingProgress merchandise={cart.subtotal - cart.discount} threshold={cart.shippingOption?.freeOver ?? null} />
          {cart.hasIssues && (
            <p className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
              Some items have changed availability. Please review the highlighted items before checking out.
            </p>
          )}
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {cart.lines.map((line) => (
              <li key={line.id} className="flex gap-4 py-6 sm:gap-6">
                <Link href={`/product/${line.slug}`} className="relative h-32 w-26 shrink-0 overflow-hidden rounded-xl bg-cream sm:h-40 sm:w-32">
                  <Image src={line.image ?? FALLBACK_IMAGE} alt={line.imageAlt} fill sizes="128px" className="object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                    <div>
                      <Link href={`/product/${line.slug}`} className="font-medium hover:text-bronze-deep">
                        {line.name}
                      </Link>
                      {line.variantLabel && <p className="mt-1 text-sm text-muted">{line.variantLabel}</p>}
                      <p className="mt-1 text-sm text-muted">{formatPrice(line.unitPrice)}</p>
                    </div>
                    <p className="font-medium tabular-nums">{formatPrice(line.lineTotal)}</p>
                  </div>
                  <LineIssue line={line} />
                  <div className="mt-auto pt-4">
                    <QuantityStepper line={line} size="md" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/shop" className="mt-6 inline-flex items-center gap-2 text-sm font-medium hover:text-bronze-deep">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Continue shopping
          </Link>
        </div>

        <aside className="h-fit rounded-[var(--radius-card)] border border-line bg-white p-6 lg:sticky lg:top-28" aria-label="Order summary">
          <h2 className="mb-5 text-lg font-semibold">Order summary</h2>
          <OrderSummary />
          {cart.hasIssues ? (
            <Button size="lg" className="mt-6 h-13 w-full" disabled>
              Review your bag to continue
            </Button>
          ) : (
            <LinkButton href="/checkout" size="lg" className="mt-6 h-13 w-full">
              <Lock className="h-4 w-4" aria-hidden /> Proceed to checkout
            </LinkButton>
          )}
          <p className="mt-4 text-center text-xs text-muted">Secure checkout · payment options shown at the payment step</p>
        </aside>
      </div>
    </div>
  );
}
