
"use client";

import ExepraLogo from "@/components/layout/ExepraLogo";
import Link from "next/link";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  SlidersHorizontal,
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

  /* Scroll detection */

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

  /* Close mobile menu on desktop resize */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /* Lock background scrolling when menu is open */

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

  /* Cart count */

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);

        if (!savedCart) {
          setCartCount(0);
          return;
        }

        const cart: CartItem[] = JSON.parse(savedCart);

        setCartCount(
          cart.reduce((total, item) => total + item.quantity, 0)
        );
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

  /* Wishlist count */

  useEffect(() => {
    const updateWishlistCount = () => {
      try {
        const savedWishlist = localStorage.getItem(
          WISHLIST_STORAGE_KEY
        );

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
      window.removeEventListener(
        "wishlist-updated",
        updateWishlistCount
      );
    };
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">

      {/* =========================================
          MOBILE HEADER
      ========================================= */}

      <div className="relative lg:hidden">

        {/* TOP ROW: visible only before scrolling */}

        <div
          aria-hidden={scrolled}
          className={`
            absolute inset-x-0 top-0
            z-10
            bg-transparent
            transition-all duration-300
            ease-[cubic-bezier(0.22,1,0.36,1)]
            ${
              scrolled
                ? "pointer-events-none -translate-y-full opacity-0"
                : "translate-y-0 opacity-100"
            }
          `}
        >
          <div
            className="
              relative flex h-[62px]
              items-center justify-between
              px-4 sm:h-[68px] sm:px-6
            "
          >
            {/* Hamburger */}

            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-full text-white
                transition-colors hover:bg-white/10
              "
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-[25px] w-[25px]" strokeWidth={1.8} />
              )}
            </button>

            {/* Centered logo */}

            <div className="absolute left-1/2 -translate-x-1/2">
              <ExepraLogo
                light
                className="text-[25px] sm:text-[28px]"
              />
            </div>

            {/* Wishlist and bag */}

            <div className="ml-auto flex items-center gap-1">
              <Link
                href="/wishlist"
                aria-label={`Wishlist${
                  wishlistCount > 0
                    ? `, ${wishlistCount} saved`
                    : ""
                }`}
                className="
                  relative flex h-10 w-10
                  items-center justify-center
                  rounded-full text-white
                  transition-colors hover:bg-white/10
                "
              >
                <Heart className="h-[22px] w-[22px]" strokeWidth={1.8} />

                {wishlistCount > 0 && (
                  <span className="
                    absolute right-0.5 top-0.5
                    flex h-[17px] min-w-[17px]
                    items-center justify-center
                    rounded-full bg-yellow-600 px-1
                    text-[9px] font-bold text-white
                  ">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                aria-label={`Shopping cart${
                  cartCount > 0 ? `, ${cartCount} items` : ""
                }`}
                className="
                  relative flex h-10 w-10
                  items-center justify-center
                  rounded-full text-white
                  transition-colors hover:bg-white/10
                "
              >
                <ShoppingBag
                  className="h-[22px] w-[22px]"
                  strokeWidth={1.8}
                />

                {cartCount > 0 && (
                  <span className="
                    absolute right-0.5 top-0.5
                    flex h-[17px] min-w-[17px]
                    items-center justify-center
                    rounded-full bg-yellow-600 px-1
                    text-[9px] font-bold text-white
                  ">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* SEARCH ROW: appears after scrolling */}

        <div
          aria-hidden={!scrolled}
          className={`
            relative z-20
            bg-white
            transition-all duration-300
            ease-[cubic-bezier(0.22,1,0.36,1)]
            ${
              scrolled
                ? "translate-y-0 opacity-100 shadow-[0_4px_20px_rgba(15,23,42,0.07)]"
                : "pointer-events-none -translate-y-2 opacity-0"
            }
          `}
        >
          <div className="flex h-[62px] items-center px-4 sm:h-[68px] sm:px-6">
            <form
              role="search"
              onSubmit={(event) => event.preventDefault()}
              className="
                flex h-[44px] w-full
                items-center rounded-full
                border border-slate-200 bg-white
                transition-all duration-200
                focus-within:border-yellow-700/60
                focus-within:shadow-[0_0_0_3px_rgba(161,98,7,0.07)]
              "
            >
              <Search
                className="ml-4 h-5 w-5 shrink-0 text-slate-500"
                strokeWidth={1.8}
              />

              <input
                type="search"
                tabIndex={scrolled ? 0 : -1}
                placeholder="Search products, brands and more..."
                aria-label="Search products, brands and categories"
                className="
                  h-full min-w-0 flex-1
                  border-0 bg-transparent
                  px-3 text-[13px] text-slate-800
                  outline-none placeholder:text-slate-400
                  focus:outline-none focus:ring-0
                  sm:text-sm
                "
              />

              <button
                type="button"
                aria-label="Product filters"
                title="Product filters"
                tabIndex={scrolled ? 0 : -1}
                className="
                  mr-1.5 flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-full text-slate-700
                  transition-colors hover:bg-slate-100
                "
              >
                <SlidersHorizontal
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* =========================================
          DESKTOP NAVIGATION — PRESERVED
      ========================================= */}

      <nav
        className={`
          relative hidden items-center
          transition-all duration-300 ease-out
          lg:flex lg:h-24 lg:px-8
          ${
            scrolled
              ? "w-full bg-white shadow-md lg:px-10"
              : "mx-auto bg-transparent"
          }
        `}
      >
        <div>
          <ExepraLogo light={!scrolled} className="text-[30px]" />
        </div>

        <div
          className={`
            absolute left-1/2 flex -translate-x-1/2
            items-center gap-8
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
                  h-[1.5px] w-full -translate-x-1/2
                  scale-x-0 transition-transform duration-500
                  ease-out group-hover:scale-x-100
                  ${scrolled ? "bg-yellow-700" : "bg-white"}
                `}
              />
            </Link>
          ))}
        </div>

        <div
          className={`
            absolute left-1/2 -translate-x-1/2
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
                -translate-y-1/2 text-slate-500
              "
            />

            <input
              type="search"
              placeholder="Search. Find. Save."
              aria-label="Search products"
              className="
                w-[620px] rounded-full
                border border-slate-300 bg-white
                py-2.5 pl-11 pr-4
                text-md text-slate-700
                placeholder:text-slate-400 shadow-sm
                transition duration-300
                focus:border-yellow-700 focus:outline-none
                focus:ring-2 focus:ring-yellow-700/20
              "
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-8">
          <Link href="/sign-in" aria-label="Sign in">
            <User
              className={`
                h-5 w-5 transition-colors
                ${
                  scrolled
                    ? "text-slate-700 hover:text-yellow-700"
                    : "text-white hover:text-yellow-500"
                }
              `}
            />
          </Link>

          <Link
            href="/wishlist"
            aria-label={`Wishlist${
              wishlistCount > 0 ? `, ${wishlistCount} saved` : ""
            }`}
            className="relative flex h-10 w-10 items-center justify-center"
          >
            <Heart
              className={`
                h-5 w-5 transition-colors
                ${
                  scrolled
                    ? "text-slate-700 hover:text-yellow-700"
                    : "text-white hover:text-yellow-500"
                }
              `}
            />

            {wishlistCount > 0 && (
              <span className="
                absolute right-0 top-0
                flex h-[17px] min-w-[17px]
                items-center justify-center
                rounded-full bg-yellow-600 px-1
                text-[9px] font-bold text-white
              ">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            aria-label={`Shopping cart${
              cartCount > 0 ? `, ${cartCount} items` : ""
            }`}
            className="relative flex h-10 w-10 items-center justify-center"
          >
            <ShoppingBag
              className={`
                h-5 w-5 transition-colors
                ${
                  scrolled
                    ? "text-slate-700 hover:text-yellow-700"
                    : "text-white hover:text-yellow-500"
                }
              `}
            />

            {cartCount > 0 && (
              <span className="
                absolute right-0 top-0
                flex h-[17px] min-w-[17px]
                items-center justify-center
                rounded-full bg-yellow-600 px-1
                text-[9px] font-bold text-white
              ">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* =========================================
          MOBILE MENU — COMPACT DROPDOWN
      ========================================= */}

      <div
        className={`
          fixed inset-0 z-[60] lg:hidden
          transition-opacity duration-300
          ${
            mobileMenuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMobileMenu}
          className="
            absolute inset-0
            bg-slate-950/20 backdrop-blur-sm
          "
        />

        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMobileMenu}
          className="
            absolute left-4 top-4 z-[70]
            flex h-10 w-10 items-center justify-center
            rounded-full text-white
            transition hover:bg-white/10 sm:left-6
          "
        >
          <X className="h-5 w-5" />
        </button>

        <div
          className={`
            absolute left-4 top-[72px] z-[70]
            w-[255px]
            transition-all duration-300 ease-out
            sm:left-6 sm:top-20
            ${
              mobileMenuOpen
                ? "translate-y-0 scale-100 opacity-100"
                : "-translate-y-2 scale-[0.98] opacity-0"
            }
          `}
        >
          <div className="
            overflow-hidden rounded-2xl
            border border-slate-200 bg-white p-2
            shadow-[0_20px_50px_rgba(15,23,42,0.18)]
          ">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeMobileMenu}
                className="
                  flex items-center justify-between
                  rounded-xl px-3.5 py-2.5
                  text-sm font-medium text-slate-800
                  transition-colors
                  hover:bg-slate-50 hover:text-yellow-700
                "
              >
                {link.name}
                <span className="text-base text-slate-400">›</span>
              </Link>
            ))}

            <div className="my-2 h-px bg-slate-100" />

            <Link
              href="/sign-in"
              onClick={closeMobileMenu}
              className="
                flex items-center gap-3
                rounded-xl px-3.5 py-2.5
                text-sm font-medium text-slate-700
                transition-colors
                hover:bg-slate-50 hover:text-yellow-700
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
