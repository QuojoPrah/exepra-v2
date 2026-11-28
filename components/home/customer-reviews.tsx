import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Stars } from "@/components/ui/stars";
import { Stagger } from "@/components/motion/reveal";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  displayName: string;
  isVerifiedPurchase: boolean;
  product: { name: string; slug: string };
};

/** Shows only approved, genuine customer reviews selected by an administrator. */
export default function CustomerReviews({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;
  return (
    <section className="py-20 sm:py-28" aria-labelledby="reviews-heading">
      <div className="container-page">
        <div className="mb-12 max-w-2xl">
          <p className="eyebrow mb-3">Customer reviews</p>
          <h2 id="reviews-heading" className="text-3xl font-semibold sm:text-4xl">
            In their words
          </h2>
        </div>
        <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" itemClassName="flex">
          {reviews.map((r) => (
            <div key={r.id} className="flex w-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-7">
              <Stars rating={r.rating} />
              {r.title && <p className="mt-5 font-display text-lg font-medium leading-snug">{r.title}</p>}
              <blockquote className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-ink-soft">“{r.body}”</blockquote>
              <div className="mt-6 border-t border-line pt-5 text-sm">
                <p className="flex items-center gap-1.5 font-medium">
                  {r.displayName}
                  {r.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-xs font-normal text-success">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Verified purchase
                    </span>
                  )}
                </p>
                <Link href={`/product/${r.product.slug}`} className="mt-0.5 block text-xs text-muted hover:text-ink">
                  on {r.product.name}
                </Link>
              </div>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
