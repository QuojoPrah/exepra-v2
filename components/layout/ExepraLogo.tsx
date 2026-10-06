"use client";

import Image from "next/image";
import Link from "next/link";

type ExepraLogoProps = {
  href?: string;
  light?: boolean;
  className?: string;
};

export default function ExepraLogo({
  href = "/",
  light = false,
  className = "",
}: ExepraLogoProps) {
  return (
    <Link
      href={href}
      aria-label="Exepra"
      className={`inline-flex items-center ${className}`}
    >
      {/* E */}
      <span
        className={`-skew-x-[6deg] origin-center font-bold tracking-[-0.050em] ${
          light ? "text-white" : "text-slate-900"
        }`}
      >
        e
      </span>

      {/* GOLD EXEPRA X */}
      <span className="mx-[2px] flex h-[0.94em] w-[0.94em] items-center justify-center">
        <Image
          src="/images/brand/exepra-x.png"
          alt=""
          width={80}
          height={80}
          priority
          className="h-full w-full object-contain"
        />
      </span>

      {/* EPRA */}
      <span
        className={`-skew-x-[6deg] origin-center font-bold tracking-[-0.055em] ${
          light ? "text-white" : "text-slate-900"
        }`}
      >
        epra
      </span>
    </Link>
  );
}