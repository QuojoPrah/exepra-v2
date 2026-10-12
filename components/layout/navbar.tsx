
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
  ArrowUpRight,
  Clock3,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { products } from "@/lib/products";

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

const formatPrice = (price: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const searchAreaRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* Scroll detection */

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 80);
        ticking = false;
      });
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

  /* Lock background scrolling for mobile menu */

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
        const saved = localStorage.getItem(CART_STORAGE_KEY);

        if (!saved) {
          setCartCount(0);
          return;
        }

        const cart: CartItem[] = JSON.parse(saved);

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
        const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);

        setWishlistCount(
          saved ? (JSON.parse(saved) as string[]).length : 0
        );
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

  /* Recent searches */

  useEffect(() => {
    try {
      const saved = localStorage.getItem("exepra-recent-searches-v1");

      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

  /* Close suggestions when clicking outside */

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        searchAreaRef.current &&
        !searchAreaRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
        setFiltersOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* Product search */

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(products.map((p) => p.category))),
    ],
    []
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products
      .filter((product) => {
        const matchesQuery =
          !normalizedQuery ||
          `${product.name} ${product.category}`
            .toLowerCase()
            .includes(normalizedQuery);

        const matchesCategory =
          selectedCategory === "All" ||
          product.category === selectedCategory;

        const matchesPrice =
          maxPrice === "all" ||
          product.price <= Number(maxPrice);

        return matchesQuery && matchesCategory && matchesPrice;
      })
      .slice(0, 6);
  }, [query, selectedCategory, maxPrice]);

  const suggestionsOpen =
    searchFocused && scrolled && !mobileMenuOpen;

  const saveRecentSearch = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) return;

    const updated = [
      trimmed,
      ...recentSearches.filter(
        (item) => item.toLowerCase() !== trimmed.toLowerCase()
      ),
    ].slice(0, 5);

    setRecentSearches(updated);

    try {
      localStorage.setItem(
        "exepra-recent-searches-v1",
        JSON.stringify(updated)
      );
    } catch {
      // Search still works if localStorage is unavailable.
    }
  };

  const openFirstResult = () => {
    if (!filteredProducts.length) return;

    saveRecentSearch(query);
    window.location.href = `/products/${filteredProducts[0].id}`;
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Escape") {
      setSearchFocused(false);
      setFiltersOpen(false);
      searchInputRef.current?.blur();
    }

    if (
      event.key === "Enter" &&
      query.trim() &&
      filteredProducts.length > 0
    ) {
      event.preventDefault();
      openFirstResult();
    }
  };

  const handleSearchSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (query.trim() && filteredProducts.length > 0) {
      openFirstResult();
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSelectedCategory("All");
    setMaxPrice("all");
    searchInputRef.current?.focus();
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  /* Shared search experience */

  const renderSearch = (mobile = false) => (
    <div
      ref={searchAreaRef}
      className={`relative w-full ${mobile ? "" : "w-[620px] max-w-[60vw]"}`}
    >
      <form
        role="search"
        onSubmit={handleSearchSubmit}
        className={`
          relative flex h-[46px] w-full items-center
          rounded-full border bg-white
          transition-all duration-200
          ${
            searchFocused
              ? "border-yellow-700/70 shadow-[0_0_0_3px_rgba(161,98,7,0.08)]"
              : "border-slate-200 hover:border-slate-300"
          }
        `}
      >
        <Search
          className="ml-4 h-5 w-5 shrink-0 text-slate-500"
          strokeWidth={1.8}
        />

        <input
          ref={mobile ? searchInputRef : undefined}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setSearchFocused(true)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search products, brands and more..."
          aria-label="Search Exepra products"
          aria-expanded={suggestionsOpen}
          aria-controls="exepra-search-suggestions"
          autoComplete="off"
          className="
            h-full min-w-0 flex-1 border-0
            bg-transparent px-3 text-sm
            text-slate-800 outline-none
            placeholder:text-slate-400
            focus:outline-none focus:ring-0
          "
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="
              mr-1 flex h-8 w-8 shrink-0
              items-center justify-center
              rounded-full text-slate-400
              hover:bg-slate-100 hover:text-slate-700
            "
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setSearchFocused(true);
            setFiltersOpen(!filtersOpen);
          }}
          aria-label="Search filters"
          aria-expanded={filtersOpen}
          className={`
            mr-1.5 flex h-9 w-9 shrink-0
            items-center justify-center rounded-full
            transition-colors
            ${
              filtersOpen
                ? "bg-yellow-50 text-yellow-800"
                : "text-slate-600 hover:bg-slate-100"
            }
          `}
        >
          <SlidersHorizontal className="h-5 w-5" strokeWidth={1.8} />
        </button>
      </form>

      {/* Suggestions and filters */}

      {suggestionsOpen && (
        <div
          id="exepra-search-suggestions"
          className="
            absolute left-0 right-0 top-[calc(100%+10px)]
            z-[80] max-h-[min(70vh,520px)] overflow-y-auto
            rounded-2xl border border-slate-200
            bg-white p-3
            shadow-[0_20px_60px_rgba(15,23,42,0.16)]
          "
        >
          {filtersOpen && (
            <div className="mb-3 rounded-xl bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">
                  Refine your search
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All");
                    setMaxPrice("all");
                  }}
                  className="text-xs font-medium text-yellow-800 hover:text-yellow-900"
                >
                  Reset
                </button>
              </div>

              <label
                htmlFor="exepra-category-filter"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Category
              </label>

              <select
                id="exepra-category-filter"
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(event.target.value)
                }
                className="
                  mb-3 w-full rounded-lg border border-slate-200
                  bg-white px-3 py-2 text-sm text-slate-700
                  outline-none focus:border-yellow-700
                "
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "All" ? "All categories" : category}
                  </option>
                ))}
              </select>

              <label
                htmlFor="exepra-price-filter"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Maximum price
              </label>

              <select
                id="exepra-price-filter"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                className="
                  w-full rounded-lg border border-slate-200
                  bg-white px-3 py-2 text-sm text-slate-700
                  outline-none focus:border-yellow-700
                "
              >
                <option value="all">Any price</option>
                <option value="25">Up to €25</option>
                <option value="50">Up to €50</option>
                <option value="100">Up to €100</option>
                <option value="200">Up to €200</option>
              </select>
            </div>
          )}

          {!query.trim() && recentSearches.length > 0 && (
            <div className="mb-3">
              <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Recent searches
              </p>

              {recentSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setQuery(item);
                    setSearchFocused(true);
                  }}
                  className="
                    flex w-full items-center gap-3
                    rounded-lg px-2 py-2 text-left
                    text-sm text-slate-600
                    hover:bg-slate-50
                  "
                >
                  <Clock3 className="h-4 w-4 text-slate-400" />
                  <span className="flex-1">{item}</span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
          )}

          {query.trim() && (
            <>
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Products
                </p>

                <span className="text-xs text-slate-400">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "match" : "matches"}
                </span>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="space-y-1">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      onClick={() => {
                        saveRecentSearch(query);
                        setSearchFocused(false);
                        setFiltersOpen(false);
                      }}
                      className="
                        flex items-center gap-3 rounded-xl
                        p-2 transition-colors hover:bg-slate-50
                      "
                    >
                      <div className="
                        flex h-14 w-14 shrink-0 items-center
                        justify-center overflow-hidden rounded-lg
                        bg-slate-50
                      ">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-slate-800">
                          {product.name}
                        </p>

                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                          {product.category}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            {formatPrice(product.price)}
                          </span>

                          {product.oldPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatPrice(product.oldPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-7 text-center">
                  <Search className="mx-auto mb-2 h-6 w-6 text-slate-300" />

                  <p className="text-sm font-medium text-slate-700">
                    No matching products found
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Try another search or adjust your filters.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("All");
                      setMaxPrice("all");
                    }}
                    className="mt-3 text-sm font-medium text-yellow-800 hover:text-yellow-900"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </>
          )}

          {!query.trim() && recentSearches.length === 0 && (
            <div className="px-2 py-4">
              <p className="text-sm font-medium text-slate-700">
                What are you looking for?
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Search products by name or category to discover something you love.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50">

      {/* MOBILE HEADER */}

      <div className="relative lg:hidden">

        {/* First row: visible only at the top */}

        <div
          aria-hidden={scrolled}
          className={`
            absolute inset-x-0 top-0 z-10
            transition-all duration-300
            ease-[cubic-bezier(0.22,1,0.36,1)]
            ${
              scrolled
                ? "pointer-events-none -translate-y-full opacity-0"
                : "translate-y-0 opacity-100"
            }
          `}
        >
          <div className="relative flex h-[62px] items-center justify-between px-4 sm:h-[68px] sm:px-6">
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-[25px] w-[25px]" strokeWidth={1.8} />
              )}
            </button>

            <div className="absolute left-1/2 -translate-x-1/2">
              <ExepraLogo
                light
                className="text-[25px] sm:text-[28px]"
              />
            </div>

            <div className="ml-auto flex items-center gap-1">
              <Link
                href="/wishlist"
                aria-label={`Wishlist${
                  wishlistCount > 0 ? `, ${wishlistCount} saved` : ""
                }`}
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10"
              >
                <Heart className="h-[22px] w-[22px]" strokeWidth={1.8} />

                {wishlistCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-yellow-600 px-1 text-[9px] font-bold text-white">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                aria-label={`Shopping cart${
                  cartCount > 0 ? `, ${cartCount} items` : ""
                }`}
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10"
              >
                <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.8} />

                {cartCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-yellow-600 px-1 text-[9px] font-bold text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search row: visible only after scrolling */}

        <div
          aria-hidden={!scrolled}
          className={`
            relative z-20 bg-white
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
            {renderSearch(true)}
          </div>
        </div>
      </div>

      {/* DESKTOP NAVIGATION */}

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
            items-center gap-8 transition-all duration-300
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
                group relative whitespace-nowrap py-2
                text-sm font-medium transition-colors duration-300
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
                  absolute bottom-0 left-1/2 h-[1.5px] w-full
                  -translate-x-1/2 scale-x-0
                  transition-transform duration-500 ease-out
                  group-hover:scale-x-100
                  ${scrolled ? "bg-yellow-700" : "bg-white"}
                `}
              />
            </Link>
          ))}
        </div>

        {/* Functional desktop search after scrolling */}

        <div
          className={`
            absolute left-1/2 w-[620px] max-w-[55vw]
            -translate-x-1/2 transition-all duration-300
            ${
              scrolled
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-2 opacity-0"
            }
          `}
        >
          {renderSearch(false)}
        </div>

        <div className="ml-auto flex items-center gap-8">
          <Link href="/sign-in" aria-label="Sign in">
            <User
              className={`h-5 w-5 ${
                scrolled
                  ? "text-slate-700 hover:text-yellow-700"
                  : "text-white hover:text-yellow-500"
              }`}
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
              className={`h-5 w-5 ${
                scrolled
                  ? "text-slate-700 hover:text-yellow-700"
                  : "text-white hover:text-yellow-500"
              }`}
            />

            {wishlistCount > 0 && (
              <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-yellow-600 px-1 text-[9px] font-bold text-white">
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
              className={`h-5 w-5 ${
                scrolled
                  ? "text-slate-700 hover:text-yellow-700"
                  : "text-white hover:text-yellow-500"
              }`}
            />

            {cartCount > 0 && (
              <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-yellow-600 px-1 text-[9px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* MOBILE MENU */}

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
          className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm"
        />

        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMobileMenu}
          className="absolute left-4 top-4 z-[70] flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 sm:left-6"
        >
          <X className="h-5 w-5" />
        </button>

        <div
          className={`
            absolute left-4 top-[72px] z-[70] w-[255px]
            transition-all duration-300 ease-out
            sm:left-6 sm:top-20
            ${
              mobileMenuOpen
                ? "translate-y-0 scale-100 opacity-100"
                : "-translate-y-2 scale-[0.98] opacity-0"
            }
          `}
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeMobileMenu}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 hover:text-yellow-700"
              >
                {link.name}
                <span className="text-base text-slate-400">›</span>
              </Link>
            ))}

            <div className="my-2 h-px bg-slate-100" />

            <Link
              href="/sign-in"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-yellow-700"
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
