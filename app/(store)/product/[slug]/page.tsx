import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Stars } from "@/components/ui/stars";
import { ProductGallery } from "@/components/product/product-gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { ReviewForm } from "@/components/product/review-form";
import ProductGrid from "@/components/product/product-grid";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { getShippingRules, getStoreSettings } from "@/lib/settings";
import { getSession } from "@/lib/session";
import { hasPurchased } from "@/lib/reviews";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { siteUrl } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Product not found" };
  const description = product.description.slice(0, 155);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: product.images.slice(0, 1).map((i) => ({ url: i.url, alt: i.alt || product.name })),
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const [related, shipping, session, settings] = await Promise.all([
    getRelatedProducts(product.id, product.categoryId),
    getShippingRules(),
    getSession(),
    getStoreSettings(),
  ]);

  let reviewEligibility: "signed-out" | "eligible" | "not-purchased" | "already-reviewed" = "signed-out";
  if (session) {
    const [purchased, existing] = await Promise.all([
      hasPurchased(session.user.id, product.id),
      db.review.findUnique({ where: { productId_userId: { productId: product.id, userId: session.user.id } }, select: { id: true } }),
    ]);
    reviewEligibility = existing ? "already-reviewed" : purchased ? "eligible" : "not-purchased";
  }

  const domestic = shipping.find((r) => r.countries.includes("DE"));
  const inStock = product.variants.some((v) => v.stock > 0);
  const specs = (product.details ?? "")
    .split("\n")
    .map((l) => l.split(":"))
    .filter((p) => p.length >= 2)
    .map(([k, ...v]) => ({ label: k.trim(), value: v.join(":").trim() }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => siteUrl(i.url)),
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: "EXEPRA" },
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      url: siteUrl(`/product/${product.slug}`),
      priceCurrency: "EUR",
      price: (Math.min(...product.variants.map((v) => v.price ?? product.price), product.price) / 100).toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    // Only real, approved customer reviews are ever exposed to search engines.
    ...(product.rating && product.rating.count > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating.average, reviewCount: product.rating.count } }
      : {}),
  };

  return (
    <div className="container-page py-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Shop", href: "/shop" },
          ...(product.category ? [{ label: product.category.name, href: `/${product.category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
        <ProductGallery images={product.images.map((i) => ({ url: i.url, alt: i.alt }))} name={product.name} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          {product.category && <p className="eyebrow">{product.category.name}</p>}
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{product.name}</h1>
          {product.rating && product.rating.count > 0 && (
            <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
              <Stars rating={product.rating.average} /> {product.rating.average} · {product.rating.count} review{product.rating.count === 1 ? "" : "s"}
            </a>
          )}
          {product.isDemo && (
            <p className="mt-4 inline-block rounded-full bg-bronze-tint px-3 py-1 text-xs font-medium text-bronze-deep">Demo product — sample content for development</p>
          )}
          <p className="mt-5 leading-relaxed text-ink-soft">{product.description}</p>

          <div className="mt-8">
            <PurchasePanel
              productId={product.id}
              basePrice={product.price}
              compareAtPrice={product.compareAtPrice}
              variants={product.variants.map((v) => ({ id: v.id, size: v.size, color: v.color, colorHex: v.colorHex, price: v.price, stock: v.stock }))}
            />
          </div>
          <p className="mt-3 text-xs text-muted">
            {settings.smallBusiness ? "Final price — no VAT is charged (§ 19 UStG), plus" : `Incl. ${product.vatRate}% VAT, plus`}{" "}
            <Link href="/versand" className="underline underline-offset-2">
              shipping
            </Link>
            .
          </p>

          <ul className="mt-8 grid gap-3 rounded-[var(--radius-card)] border border-line bg-white p-5 text-sm">
            {domestic && (
              <li className="flex gap-3">
                <Truck className="h-5 w-5 shrink-0 text-bronze-deep" aria-hidden />
                <span>
                  {domestic.name} in Germany: {domestic.minDays}–{domestic.maxDays} business days, {formatPrice(domestic.price)}
                  {domestic.freeOver ? ` — free from ${formatPrice(domestic.freeOver)}` : ""}.
                </span>
              </li>
            )}
            <li className="flex gap-3">
              <RotateCcw className="h-5 w-5 shrink-0 text-bronze-deep" aria-hidden />
              <span>
                Statutory 14-day right of withdrawal. See{" "}
                <Link href="/rueckgabe" className="underline underline-offset-2">
                  returns
                </Link>{" "}
                and{" "}
                <Link href="/widerrufsbelehrung" className="underline underline-offset-2">
                  cancellation policy
                </Link>
                .
              </span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-bronze-deep" aria-hidden />
              <span>Secure payment processed by Stripe.</span>
            </li>
          </ul>

          <div className="mt-6 divide-y divide-line border-y border-line">
            {specs.length > 0 && (
              <details className="group py-4" open>
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  Specifications <span className="text-muted transition group-open:rotate-45">+</span>
                </summary>
                <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 text-sm">
                  {specs.map((s) => (
                    <div key={s.label} className="contents">
                      <dt className="text-muted">{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}
            {product.careInfo && (
              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  Care <span className="text-muted transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{product.careInfo}</p>
              </details>
            )}
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                Shipping &amp; returns <span className="text-muted transition group-open:rotate-45">+</span>
              </summary>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
                {shipping.map((r) => (
                  <li key={r.code}>
                    <strong className="font-medium text-ink">{r.name}</strong> ({r.countries.join(", ")}): {formatPrice(r.price)}, {r.minDays}–{r.maxDays} business days
                    {r.freeOver ? `, free from ${formatPrice(r.freeOver)}` : ""}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-ink-soft">
                Details on our{" "}
                <Link href="/versand" className="underline underline-offset-2">
                  shipping page
                </Link>
                .
              </p>
            </details>
          </div>
        </div>
      </div>

      <section id="reviews" className="mt-20 scroll-mt-28 border-t border-line pt-14" aria-labelledby="reviews-title">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div>
            <h2 id="reviews-title" className="text-2xl font-semibold sm:text-3xl">
              Customer reviews
            </h2>
            {product.rating ? (
              <p className="mt-3 flex items-center gap-3 text-muted">
                <Stars rating={product.rating.average} size={18} />
                <span>
                  {product.rating.average} out of 5 · {product.rating.count} review{product.rating.count === 1 ? "" : "s"}
                </span>
              </p>
            ) : (
              <p className="mt-3 text-muted">No reviews yet. Reviews are written by verified purchasers only.</p>
            )}
            <div className="mt-8">
              {reviewEligibility === "eligible" && <ReviewForm productId={product.id} defaultName={session!.user.name.split(" ")[0]} />}
              {reviewEligibility === "signed-out" && (
                <p className="text-sm text-muted">
                  Bought this item?{" "}
                  <Link href={`/account/login?next=/product/${product.slug}%23reviews`} className="font-medium text-ink underline underline-offset-2">
                    Sign in
                  </Link>{" "}
                  to share your review.
                </p>
              )}
              {reviewEligibility === "not-purchased" && <p className="text-sm text-muted">Only customers who have purchased this item can leave a review.</p>}
              {reviewEligibility === "already-reviewed" && <p className="text-sm text-muted">Thank you — you&apos;ve already reviewed this product.</p>}
            </div>
          </div>
          <ul className="space-y-5">
            {product.reviews.map((r) => (
              <li key={r.id} className="rounded-[var(--radius-card)] border border-line bg-white p-6">
                <div className="flex items-center justify-between gap-4">
                  <Stars rating={r.rating} />
                  <time className="text-xs text-muted" dateTime={r.createdAt.toISOString()}>
                    {formatDate(r.createdAt)}
                  </time>
                </div>
                {r.title && <p className="mt-3 font-medium">{r.title}</p>}
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.body}</p>
                <p className="mt-4 flex items-center gap-2 text-xs text-muted">
                  {r.displayName}
                  {r.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-success">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Verified purchase
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-14" aria-labelledby="related-title">
          <h2 id="related-title" className="mb-8 text-2xl font-semibold sm:text-3xl">
            You may also like
          </h2>
          <ProductGrid products={related} />
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
