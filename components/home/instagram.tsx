import Image from "next/image";
import Link from "next/link";

const images = [
  {
    src: "/images/instagram/insta1.jpg",
    alt: "Exepra lifestyle inspiration",
  },
  {
    src: "/images/instagram/insta2.jpg",
    alt: "Exepra everyday essentials",
  },
  {
    src: "/images/instagram/insta3.jpg",
    alt: "Exepra home inspiration",
  },
  {
    src: "/images/instagram/insta4.jpg",
    alt: "Exepra lifestyle collection",
  },
  {
    src: "/images/instagram/insta5.jpg",
    alt: "Exepra product inspiration",
  },
  {
    src: "/images/instagram/insta6.jpg",
    alt: "Exepra everyday living",
  },
];

export default function Instagram() {
  return (
    <section className="bg-white py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-slate-400">
            FROM THE EXEPRA WORLD
          </p>

          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Everyday living,
            <br />
            beautifully considered.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-500 md:text-lg">
            Discover inspiration, new arrivals, and moments from the world of
            Exepra.
          </p>
        </div>

        {/* Image Grid */}
        <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {images.map((image, index) => (
            <Link
              key={image.src}
              href="https://www.instagram.com/exepra"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View Exepra on Instagram - image ${index + 1}`}
              className="group relative aspect-square overflow-hidden rounded-[24px] bg-slate-100 sm:rounded-[28px]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/35" />

              {/* Instagram Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition-transform duration-500 group-hover:scale-100">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <circle
                      cx="17.5"
                      cy="6.5"
                      r="1"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>

              {/* Image Number */}
              <div className="absolute bottom-4 left-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/80">
                  EXEPRA
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Instagram CTA */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 text-center sm:flex-row">
          <span className="text-sm text-slate-500">
            Follow along
          </span>

          <Link
            href="https://www.instagram.com/exepra"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 text-sm font-semibold text-slate-900"
          >
            <span>@exepra</span>

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
    </section>
  );
}