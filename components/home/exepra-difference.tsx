import Image from "next/image";
import Link from "next/link";

const principles = [
  {
    number: "01",
    title: "Thoughtfully Curated",
    description:
      "Products selected with purpose, so you spend less time searching and more time discovering.",
  },
  {
    number: "02",
    title: "Made for Everyday Life",
    description:
      "Useful pieces that bring together function, quality, and effortless style.",
  },
  {
    number: "03",
    title: "A Better Way to Shop",
    description:
      "A considered marketplace built around discovery, trust, and simplicity.",
  },
];

export default function WhyExepra() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          {/* Image */}
          <div className="relative min-h-[520px] overflow-hidden rounded-[32px] bg-slate-100 md:min-h-[620px]">
            <Image
              src="/images/cozyliving3.jpg"
              alt="Thoughtfully curated Exepra lifestyle"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-[1200ms] ease-out hover:scale-[1.025]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            {/* Image Label */}
            <div className="absolute bottom-7 left-7 md:bottom-9 md:left-9">
              <div className="rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-md">
                The Exepra Way
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:py-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-slate-400">
              THE EXEPRA DIFFERENCE
            </p>

            <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              Curated
              <br />
              with intention.
            </h2>

            <p className="mt-7 max-w-xl text-base leading-7 text-slate-500 md:text-lg md:leading-8">
              We believe the things you bring into your life should be useful,
              beautiful, and worth keeping. Exepra brings together thoughtfully
              selected products for modern living — from everyday essentials to
              pieces that simply make life better.
            </p>

            {/* Principles */}
            <div className="mt-10 border-t border-slate-200">
              {principles.map((principle) => (
                <div
                  key={principle.number}
                  className="group grid grid-cols-[42px_1fr] gap-5 border-b border-slate-200 py-6 md:grid-cols-[50px_1fr] md:gap-6"
                >
                  <span className="pt-1 text-[10px] font-semibold tracking-[0.18em] text-yellow-700">
                    {principle.number}
                  </span>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900 transition-colors duration-300 group-hover:text-yellow-700 md:text-lg">
                      {principle.title}
                    </h3>

                    <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500 md:text-[15px]">
                      {principle.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/about"
              className="group mt-9 inline-flex items-center gap-3 text-sm font-semibold text-slate-900"
            >
              <span>Discover the Exepra story</span>

              <span
                aria-hidden="true"
                className="flex items-center transition-transform duration-300 group-hover:translate-x-1"
              >
                <svg
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L6 6L1 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}