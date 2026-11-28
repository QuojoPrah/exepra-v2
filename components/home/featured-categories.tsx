import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { FALLBACK_IMAGE } from "@/lib/site";
import { Stagger } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";

type Category = { id: string; slug: string; name: string; description: string | null; image: string | null };

export default function FeaturedCategories({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;
  return (
    <section className="py-20 sm:py-28" aria-labelledby="categories-heading">
      <div className="container-page">
        <div id="categories-heading">
          <SectionHeading eyebrow="Shop by category" title="Find what you're looking for" href="/shop" linkLabel="Shop all" />
        </div>
        <Stagger className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4" stagger={0.1}>
          {categories.map((c, i) => (
            <div key={c.id}>
              <Link href={`/${c.slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-cream">
                <Parallax strength={7}>
                  <Image
                    src={c.image ?? FALLBACK_IMAGE}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    priority={i < 2}
                    className="object-cover transition duration-[1200ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.06]"
                  />
                </Parallax>
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" aria-hidden />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
                  <h3 className="text-lg font-semibold sm:text-2xl">{c.name}</h3>
                  {c.description && <p className="mt-1 hidden text-sm text-white/80 sm:line-clamp-2">{c.description}</p>}
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] sm:text-[0.72rem]">
                    Shop now <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
