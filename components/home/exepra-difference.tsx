import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Reveal, RevealText, Stagger } from "@/components/motion/reveal";
import { ClipReveal, Parallax } from "@/components/motion/parallax";

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
        <ClipReveal className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--radius-card)*1.5)] bg-cream lg:aspect-[5/6]">
          <Parallax strength={9}>
            <Image src="/images/cozyliving3.jpg" alt="A calm, carefully styled interior" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
          </Parallax>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" aria-hidden />
          <span className="absolute bottom-6 left-6 rounded-full border border-white/25 bg-black/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-md">
            The EXEPRA way
          </span>
        </ClipReveal>

        <div>
          <Reveal y={12}>
            <p className="eyebrow">The EXEPRA Difference</p>
          </Reveal>
          <RevealText id="difference-heading" text={"Chosen with care,\nmade for real life."} className="mt-4 max-w-xl text-4xl font-semibold leading-[1.08] sm:text-5xl" />
          <Reveal delay={0.3} as="p" className="mt-5 max-w-lg leading-relaxed text-muted">
            We don&apos;t aim to sell everything. We aim to offer the right things — pieces that feel good, look considered and earn their place in your everyday.
          </Reveal>

          <Stagger as="ol" className="mt-10 divide-y divide-line border-y border-line" itemClassName="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 py-6" stagger={0.12}>
            {principles.map((p, i) => (
              <div key={p.title} className="contents">
                <span className="font-display text-sm font-medium text-bronze-deep tabular-nums">0{i + 1}</span>
                <div>
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{p.description}</p>
                </div>
              </div>
            ))}
          </Stagger>

          <Link href="/about" className={buttonClasses("outline", "md", "mt-10")}>
            Our story
          </Link>
        </div>
      </div>
    </section>
  );
}
