import Image from "next/image";
import Link from "next/link";

export default function FeaturedCollection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative h-[580px] overflow-hidden rounded-[36px]">
          <Image
            src="/images/cozyliving3.jpg"
            alt="Summer Collection"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />

          {/* Cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

          <div className="absolute inset-0 flex items-center">
            <div className="max-w-xl pl-8 pt-10 sm:pl-12 md:pl-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-yellow-400">
                NEW IN
              </p>

              <h2 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
                Summer
                <br />
                Essentials
              </h2>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
                Discover beautifully curated collections designed for every
                part of your lifestyle.
              </p>

              <Link
                href="/collections"
                className="group mt-10 inline-flex h-14 min-w-[190px] items-center justify-center gap-3 rounded-full bg-white px-7 text-[15px] font-semibold text-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(255,255,255,0.22)]"
              >
                <span>Explore Collection</span>

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
      </div>
    </section>
  );
}