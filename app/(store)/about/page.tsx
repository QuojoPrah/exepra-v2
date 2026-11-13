import type { Metadata } from "next";
import Image from "next/image";
import { LinkButton } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "About EXEPRA",
  description: "EXEPRA is a curated online store for women and little ones — thoughtfully selected pieces for everyday life.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div>
      <div className="container-page py-10 sm:py-14">
        <Breadcrumbs items={[{ label: "About" }]} />
        <div className="mt-8 grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow">Our story</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">Fewer, better things — chosen with care.</h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              EXEPRA was created for women and families who value quality over quantity. We look for pieces that feel good, look considered and make everyday life a little easier — so you can spend less time searching and more time living.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              Our emblem draws on Adinkra symbolism — a reminder that the things we choose to surround ourselves with carry meaning.
            </p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--radius-card)*1.5)] bg-cream">
            <Image src="/images/cozyliving.jpg" alt="A warm, calm living space" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </div>
      <section className="bg-cream py-20">
        <div className="container-page grid gap-10 md:grid-cols-3">
          {[
            ["Curated, not crowded", "Every piece in our edit is selected for quality, style and practicality."],
            ["Made for everyday", "We favour versatile pieces that work for real schedules — yours and theirs."],
            ["Simple and secure", "Clear prices, secure payments and straightforward service, from checkout to delivery."],
          ].map(([t, d]) => (
            <div key={t}>
              <h2 className="text-xl font-semibold">{t}</h2>
              <p className="mt-2 leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="container-page flex flex-col items-center py-20 text-center">
        <h2 className="text-3xl font-semibold">Discover the edit</h2>
        <div className="mt-6 flex gap-3">
          <LinkButton href="/women" variant="outline">Shop Women</LinkButton>
          <LinkButton href="/kids">Shop Kids</LinkButton>
        </div>
      </div>
    </div>
  );
}
