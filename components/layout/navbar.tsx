"use client";

import Link from "next/link";
import { Heart, Search, ShoppingBag, User, } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { name: "Home & Living", href: "#" },
  { name: "Tech & Gadgets", href: "#" },
  { name: "Fitness", href: "#" },
  { name: "Kids", href: "#" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-in-out">
      
      <nav
        className={`flex h-24 items-center justify-between transition-all duration-500
        ease-in-out
        ${
        scrolled
        ? "w-full bg-white px-10 shadow-md"
        : "mx-auto rounded-1xl bg-transparent px-8"
        }`}
        >

        {/* Logo */}
        <Link
          href="/"
          className="text-3xl font-extrabold tracking-tight"
        >
          <span className={`
            transition-colors
            duration-500
            ease-in-out
            ${scrolled ? "text-slate-900" : "text-white"}`}>
            exe
          </span>
          <span className="text-yellow-700">pra</span>
        </Link>

        {/* Navigation */}
        <div className={`
          hidden
          items-center
          gap-8
          lg:flex
          transition-all
          duration-300
          ${scrolled ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`group relative py-2 text-sm font-medium transition-colors duration-300 ${scrolled
              ? "text-slate-700 hover:text-blue-700"
              : "text-white/90 hover:text-white"
            }`}
            >
              {link.name}

              <span

                className={`absolute bottom-0 left-1/2 h-[1.5px] w-full -translate-x-1/2 scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 ${

                  scrolled ? "bg-blue-700" : "bg-white"

                }`}
              />
            </Link>
          ))}

        </div>


        {/* Search (Only when scrolled) */}
        <div
          className={`
            absolute
            left-1/2
            -translate-x-1/2
            transition-all
            duration-500
            ease-in-out
            ${
              scrolled
                ? "opacity-100 translate-y-0"
                : "pointer-events-none opacity-0 -translate-y-2"
            }
          `}
          >
          <div className="relative">

            <Search
              size={18}
              strokeWidth={2}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              placeholder="Search products..."
              className="
                w-[620px]
                rounded-full
                border
                border-slate-300
                bg-white
                py-2.5
                pl-11
                pr-4
                text-md
                text-slate-700
                placeholder:text-slate-400
                shadow-sm
                transition-all
                duration-300
                focus:outline-none
                focus:ring-2
                focus:ring-yellow-700/20
              "
            />

          </div>
        </div>


        

        {/* Icons */}
        <div className="flex items-center gap-8">

          <User
          className={`h-5 w-5 cursor-pointer transition ${
          scrolled
          ? "text-slate-700 hover:text-blue-700"
          : "text-white hover:text-white/70"
          }`}
          />
          <Heart
          className={`h-5 w-5 cursor-pointer transition ${
          scrolled
          ? "text-slate-700 hover:text-blue-700"
          : "text-white hover:text-white/70"
          }`}
          />
          <ShoppingBag
          className={`h-5 w-5 cursor-pointer transition ${
          scrolled
          ? "text-slate-700 hover:text-blue-700"
          : "text-white hover:text-white/70"
          }`}
          />
        </div>
      </nav>
    </header>
  );
}
