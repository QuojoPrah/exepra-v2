"use client";

import ExepraLogo from "@/components/layout/ExepraLogo";
import Link from "next/link";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { name: "Home & Living", href: "#" },
  { name: "Tech & Gadgets", href: "#" },
  { name: "Fitness", href: "#" },
  { name: "Kids", href: "#" },
];

const CART_STORAGE_KEY = "exepra-cart-v2";
const WISHLIST_STORAGE_KEY = "exepra-wishlist-v1";

type CartItem = {
  quantity: number;
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  /* ---------------------------------------------
     Scroll detection
  --------------------------------------------- */

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 80);
          ticking = false;
        });

        ticking = true;
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* ---------------------------------------------
     Close mobile UI when resizing to desktop
  --------------------------------------------- */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /* ---------------------------------------------
     Prevent body scrolling when mobile menu is open
  --------------------------------------------- */

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  /* ---------------------------------------------
     Load cart quantity
  --------------------------------------------- */

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);

        if (!savedCart) {
          setCartCount(0);
          return;
        }

        const cart: CartItem[] = JSON.parse(savedCart);

        const count = cart.reduce(
          (total, item) => total + item.quantity,
          0
        );

        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, []);

  /* ---------------------------------------------
     Load wishlist quantity
  --------------------------------------------- */

  useEffect(() => {
    const updateWishlistCount = () => {
      try {
        const savedWishlist =
          localStorage.getItem(WISHLIST_STORAGE_KEY);

        if (!savedWishlist) {
          setWishlistCount(0);
          return;
        }

        const wishlist: string[] = JSON.parse(savedWishlist);

        setWishlistCount(wishlist.length);
      } catch {
        setWishlistCount(0);
      }
    };

    updateWishlistCount();

    window.addEventListener("storage", updateWishlistCount);
    window.addEventListener("wishlist-updated", updateWishlistCount);

    return () => {
      window.removeEventListener("storage", updateWishlistCount);
      window.removeEventListener("wishlist-updated", updateWishlistCount);
    };
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        className={`
          relative flex items-center
          transition-all duration-300 ease-out

          h-[72px]
          px-4

          sm:h-20
          sm:px-6

          lg:h-24
          lg:px-8

          ${
            scrolled
              ? "w-full bg-white shadow-md lg:px-10"
              : "mx-auto bg-transparent"
          }
        `}
      >
        {/* =========================================
            MOBILE MENU BUTTON
        ========================================= */}

        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`
            flex h-10 w-10 items-center justify-center
            rounded-full transition-colors
            lg:hidden
            ${
              scrolled
                ? "text-slate-800 hover:bg-slate-100"
                : "text-white hover:bg-white/10"
            }
          `}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* =========================================
            LOGO
        ========================================= */}

        <div
         className={`
          absolute
          left-1/2
          top-1/2
          -translate-x-1/2
          -translate-y-1/2
          lg:hidden
          transition-all duration-500 ease-[cubic-bezier(0.22, 1, 0.36, 1)]

          ${ 
           scrolled
          ? "pointer-events-none  scale-95 opacity-0"
          : "scale-100 opacity-100 lg:static lg:translate-y-0"
          }
          `}
        >

        <ExepraLogo
          light={!scrolled}
          className="
            text-[24px]
            sm:text-[27px]
            lg:text-[30px]
          "
        />
        </div>

        {/* Desktop Logo */}

        <div className="hidden lg:flex">
          <ExepraLogo
            light={!scrolled}
            className="text-[30px]"
          />
        </div>


        {/* =========================================
        MOBILE SEARCH — SCROLLED STATE
        ========================================= */}
        <div
          className={`
            absolute
            left-1/2
            top-1/2
            -translate-x-1/2
            -translate-y-1/2
            lg:hidden
            transition-all
            duration-500
            ease-[cubic-bezier(0.22,1,0.36,1)]

            ${
              scrolled
              ? "pointer-events-auto scale-100 opacity-100"
              : "pointer-events-none scale-95 opacity-0"
            }
          `}
        >
          <div className="relative">
            <Search
              className="
                absolute
                left-3.5
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="search"
              placeholder="Search. Find. Save."
              aria-label="Search products"
              className="
                h-9
                w-[min(52vw,320px)]
                rounded-full
                border
                border-slate-200
                bg-slate-50
                pl-9
                pr-3
                text-xs
                text-slate-700
                placeholder:text-slate-400
                shadow-s
                focus:border-yellow-700
                focus:bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-yellow-700/20
              "
            />
          </div>
        </div>

        {/* =========================================
            DESKTOP NAVIGATION
            CENTERED INDEPENDENTLY FROM LOGO
        ========================================= */}

        <div
          className={`
            absolute left-1/2
            hidden -translate-x-1/2
            items-center gap-8
            lg:flex
            transition-all duration-300

            ${
              scrolled
                ? "pointer-events-none opacity-0"
                : "opacity-100"
            }
          `}
        >
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`
                group relative whitespace-nowrap
                py-2 text-sm font-medium
                transition-colors duration-300
                ${
                  scrolled
                    ? "text-slate-700 hover:text-yellow-700"
                    : "text-white/90 hover:text-white"
                }
              `}
            >
              {link.name}

              <span
                className={`
                  absolute bottom-0 left-1/2
                  h-[1.5px] w-full
                  -translate-x-1/2
                  scale-x-0
                  transition-transform duration-500
                  ease-out
                  group-hover:scale-x-100
                  ${
                    scrolled
                      ? "bg-yellow-700"
                      : "bg-white"
                  }
                `}
              />
            </Link>
          ))}
        </div>

        {/* =========================================
            DESKTOP SEARCH
        ========================================= */}

        <div
          className={`
            absolute left-1/2
            hidden -translate-x-1/2
            lg:block
            transition-all duration-300 ease-out

            ${
              scrolled
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-2 opacity-0"
            }
          `}
        >
          <div className="relative">
            <Search
              size={18}
              strokeWidth={2}
              className="
                absolute left-4 top-1/2
                -translate-y-1/2
                text-slate-500
              "
            />

            <input
              type="search"
              placeholder="Search. Find. Save."
              aria-label="Search products"
              className="
                w-[620px]
                rounded-full
                border border-slate-300
                bg-white
                py-2.5
                pl-11 pr-4
                text-md
                text-slate-700
                placeholder:text-slate-400
                shadow-sm
                transition
                duration-300
                focus:border-yellow-700
                focus:outline-none
                focus:ring-2
                focus:ring-yellow-700/20
              "
            />
          </div>
        </div>

        {/* =========================================
            RIGHT SIDE ICONS
        ========================================= */}

        <div className="ml-auto flex items-center sm:gap-1 lg:gap-8">
          {/* Mobile Search */}

          {!scrolled && (
            <button
              type="button"
              aria-label="Search"
              onClick={() =>
                setMobileSearchOpen(!mobileSearchOpen)
              }
              className={`
                flex h-10 w-10
                items-center justify-center
                rounded-full
                transition-colors
                lg:hidden
                ${
                  scrolled
                    ? "text-slate-700 hover:bg-slate-100"
                    : "text-white hover:bg-white/10"
                }
              `}
            >
              <Search className="h-5 w-5" />
            </button>
          )}

          {/* User */}

          <Link
            href="/sign-in"
            aria-label="Sign in"
            className="hidden sm:flex"
          >
            <User
              className={`
                h-5 w-5
                transition-colors
                ${
                  scrolled
                    ? "text-slate-700 hover:text-yellow-700"
                    : "text-white hover:text-yellow-500"
                }
              `}
            />
          </Link>

          {/* Wishlist */}

          <Link
            href="/wishlist"
            aria-label={`Wishlist${
              wishlistCount > 0
                ? `, ${wishlistCount} saved`
                : ""
            }`}
            className="relative flex h-10 w-10 items-center justify-center"
          >
            <Heart
              className={`
                h-5 w-5
                transition-colors
                ${
                  scrolled
                    ? "text-slate-700 hover:text-yellow-700"
                    : "text-white hover:text-yellow-500"
                }
              `}
            />

            {wishlistCount > 0 && (
              <span
                className="
                  absolute right-0 top-0
                  flex h-[17px] min-w-[17px]
                  items-center justify-center
                  rounded-full
                  bg-yellow-600
                  px-1
                  text-[9px]
                  font-bold leading-none
                  text-white shadow-sm
                "
              >
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>

          {/* Shopping Cart */}

          <Link
            href="/cart"
            aria-label={`Shopping cart${
              cartCount > 0
                ? `, ${cartCount} items`
                : ""
            }`}
            className="relative flex h-10 w-10 items-center justify-center"
          >
            <ShoppingBag
              className={`
                h-5 w-5
                transition-colors
                ${
                  scrolled
                    ? "text-slate-700 hover:text-yellow-700"
                    : "text-white hover:text-yellow-500"
                }
              `}
            />

            {cartCount > 0 && (
              <span
                className="
                  absolute right-0 top-0
                  flex h-[17px] min-w-[17px]
                  items-center justify-center
                  rounded-full
                  bg-yellow-600
                  px-1
                  text-[9px]
                  font-bold leading-none
                  text-white shadow-sm
                "
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* =========================================
          MOBILE SEARCH PANEL
      ========================================= */}

      <div
        className={`
          overflow-hidden
          border-b border-slate-200
          bg-white
          transition-all duration-300 ease-out
          lg:hidden

          ${
            mobileSearchOpen
              ? "max-h-24 opacity-100"
              : "pointer-events-none max-h-0 opacity-0"
          }
        `}
      >
        <div className="px-4 py-3">
          <div className="relative">
            <Search
              size={18}
              className="
                absolute left-4 top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="search"
              autoFocus={mobileSearchOpen}
              placeholder="Search. Find. Save."
              aria-label="Search products"
              className="
                w-full
                rounded-full
                border border-slate-300
                bg-slate-50
                py-3
                pl-11 pr-4
                text-sm
                text-slate-700
                placeholder:text-slate-400
                focus:border-yellow-700
                focus:bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-yellow-700/20
              "
            />
          </div>
        </div>
      </div>

      {/* =========================================
      MOBILE MENU
      ========================================= */}

      <div
        className={`
          fixed
          inset-0
          z-[60]
          lg:hidden
          transition-opacity
          duration-300
          ${
            mobileMenuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      >
        {/* Blurred website backdrop */}

        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMobileMenu}
          className="
            absolute
            inset-0
            bg-slate-950/20
            backdrop-blur-sm
          "
        />

        {/* ONLY X stays visible */}

        <button

          type="button"

          aria-label="Close menu"

          onClick={closeMobileMenu}

          className="

            absolute

            left-4 top-4

            z-[70]

            flex h-10 w-10

            items-center justify-center

            rounded-full

            text-white

            transition

            hover:bg-white/10

            sm:left-6

          "

        >

          <X className="h-5 w-5" />

        </button>

        {/* Dropdown menu */}

        <div
          className={`
            absolute
            left-4
            top-[72px]
            sm:left-6
            sm:top-20
            z-70
            w-[255px]
            transition-all
            duration-300
            ease-out

            ${
              mobileMenuOpen
                ? "translate-y-0 scale-100 opacity-100"
                : "-translate-y-2 scale-[0.98] opacity-0"
            }
          `}
        >
          <div
            className="
              overflow-hidden
              rounded-2xl
              border border-slate-200
              bg-white
              p-2
              shadow-[0_20px_50px_rgba(15,23,42,0.18)]
            "
          >
            {/* Navigation links */}

            <div>
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="
                    flex items-center
                    justify-between
                    rounded-xl
                    px-3.5
                    py-2.5
                    text-sm
                    font-medium
                    text-slate-800
                    transition-colors
                    hover:bg-slate-50
                    hover:text-yellow-700
                  "
                >
                  {link.name}

                  <span className="text-base text-slate-400">
                    ›
                  </span>
                </Link>
              ))}
            </div>

            {/* Divider */}

            <div className="my-2 h-px bg-slate-100" />

            {/* Account */}

            <Link
              href="/sign-in"
              onClick={closeMobileMenu}
              className="
                flex items-center
                gap-3
                rounded-xl
                px-3.5
                py-2.5
                text-sm
                font-medium
                text-slate-700
                transition-colors
                hover:bg-slate-50
                hover:text-yellow-700
              "
            >
              <User className="h-[18px] w-[18px] text-slate-500" />

              Sign in to Exepra
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}