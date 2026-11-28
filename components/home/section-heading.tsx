import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal, RevealText } from "@/components/motion/reveal";

export function SectionHeading({ eyebrow, title, description, href, linkLabel }: { eyebrow?: string; title: string; description?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <Reveal y={12}>
            <p className="eyebrow mb-3">{eyebrow}</p>
          </Reveal>
        )}
        <RevealText text={title} className="text-3xl font-semibold leading-tight sm:text-4xl" />
        {description && (
          <Reveal delay={0.25} y={14}>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{description}</p>
          </Reveal>
        )}
      </div>
      {href && (
        <Reveal delay={0.3} y={14}>
          <Link href={href} className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-ink">
            <span className="border-b border-ink/30 pb-0.5 transition-colors group-hover:border-ink">{linkLabel ?? "View all"}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </Reveal>
      )}
    </div>
  );
}
