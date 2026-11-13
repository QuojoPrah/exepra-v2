import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

const principles = [
  {
    title: "Thoughtfully Curated",
    description: "We focus on selecting products that bring quality, style, and practicality together.",
  },
  {
    title: "Designed for Everyday Living",
    description: "Discover products that complement modern lifestyles and everyday needs.",
  },
  {
    title: "A Better Shopping Experience",
    description: "We believe shopping should be simple, convenient, and enjoyable.",
  },
  {
    title: "Quality You Can Appreciate",
    description: "Every selection should reflect our commitment to thoughtful choices and customer satisfaction.",
  },
];

export default function ExepraDifference() {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="difference-heading">
      <div className="container-page grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--radius-card)*1.5)] bg-cream lg:aspect-[5/6]">
          <Image src="/images/cozyliving3.jpg" alt="A calm, carefully styled interior" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" aria-hidden />
          <span className="absolute bottom-6 left-6 rounded-full border border-white/25 bg-black/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-md">
            The EXEPRA way
          </span>
        </div>

        <div>
          <p className="eyebrow">The EXEPRA Difference</p>
          <h2 id="difference-heading" className="mt-4 max-w-xl text-4xl font-semibold leading-[1.08] sm:text-5xl">
            Chosen with care,
            <br />
            made for real life.
          </h2>
          <p className="mt-5 max-w-lg leading-relaxed text-muted">
            We don&apos;t aim to sell everything. We aim to offer the right things — pieces that feel good, look considered and earn their place in your everyday.
          </p>

          <ol className="mt-10 divide-y divide-line border-y border-line">
            {principles.map((p, i) => (
              <li key={p.title} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 py-6">
                <span className="font-display text-sm font-medium text-bronze-deep tabular-nums">0{i + 1}</span>
                <div>
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{p.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <Link href="/about" className={buttonClasses("outline", "md", "mt-10")}>
            Our story
          </Link>
        </div>
      </div>
    </section>
  );
}
