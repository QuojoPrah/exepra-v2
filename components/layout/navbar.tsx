"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ExepraLogo from "@/components/layout/ExepraLogo";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { useCart, useWishlist } from "@/components/providers/store-providers";
import { cn } from "@/lib/utils";

type NavItem = { slug: string; name: string };

const PRIMARY = [
  { name: "Home", href: "/" },
  { name: "Women", href: "/women" },
  { name: "Kids", href: "/kids" },
  { name: "Collections", href: "/collections", dropdown: true },
  { name: "New Arrivals", href: "/new-arrivals" },
  { name: "Sale", href: "/sale" },
] as const;

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-bronze-deep px-1 text-[10px] font-semibold leading-none text-white" aria-hidden>
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function Navbar({ categories, collections }: { categories: NavItem[]; collections: NavItem[] }) {
  const pathname = usePathname();
  const overHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  // Each overlay remembers the path it was opened on; navigating closes it automatically.
  const [menuOn, setMenuOn] = useState<string | null>(null);
  const [searchOn, setSearchOn] = useState<string | null>(null);
  const [dropdownOn, setDropdownOn] = useState<string | null>(null);
  const menuOpen = menuOn === pathname;
  const searchOpen = searchOn === pathname;
  const dropdownOpen = dropdownOn === pathname;
  const setMenuOpen = (v: boolean) => setMenuOn(v ? pathname : null);
  const setSearchOpen = (v: boolean) => setSearchOn(v ? pathname : null);
  const setDropdownOpen = (v: boolean | ((prev: boolean) => boolean)) =>
    setDropdownOn((prev) => ((typeof v === "function" ? v(prev === pathname) : v) ? pathname : null));
  const dropdownRef = useRef<HTMLLIElement>(null);
  const { count: cartCount, openDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setDropdownOn(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDropdownOn(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Keyboard shortcut: "/" opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        setSearchOn(window.location.pathname);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const transparent = overHero && !scrolled && !menuOpen;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const iconBtn = cn(
    "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors",
    transparent ? "text-white hover:bg-white/10" : "text-ink hover:bg-cream",
  );

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-500 ease-[var(--ease-out-soft)]",
          overHero && "-mb-[68px] lg:-mb-[80px]",
          transparent ? "border-b border-transparent bg-transparent" : "border-b border-line/70 bg-ivory/95 shadow-[0_1px_0_rgb(0_0_0/0.02)] backdrop-blur-md",
        )}
      >
        {transparent && <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/35 to-transparent" aria-hidden />}
        <nav aria-label="Main" className="container-page flex h-[68px] items-center gap-4 lg:h-[80px]">
          {/* Mobile: menu button */}
          <button type="button" className={cn(iconBtn, "-ml-2 lg:hidden")} aria-label="Open menu" aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(true)}>
            <Menu className="h-[22px] w-[22px]" strokeWidth={1.6} />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
            <ExepraLogo light={transparent} className="text-[26px] lg:text-[30px]" />
          </div>

          {/* Desktop links */}
          <ul className="mx-auto hidden items-center gap-1 lg:flex">
            {PRIMARY.map((item) =>
              "dropdown" in item ? (
                <li key={item.name} ref={dropdownRef} className="relative" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
                  <button
                    type="button"
                    aria-expanded={dropdownOpen}
                    aria-controls="collections-menu"
                    onClick={() => setDropdownOpen((v) => !v)}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-4 py-2 text-[0.9rem] font-medium transition-colors",
                      transparent ? "text-white/90 hover:text-white" : "text-ink-soft hover:text-ink",
                      isActive(item.href) && (transparent ? "text-white" : "text-ink"),
                    )}
                  >
                    {item.name}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", dropdownOpen && "rotate-180")} aria-hidden />
                  </button>
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        id="collections-menu"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-1/2 top-full w-[520px] -translate-x-1/2 pt-3"
                      >
                        <div className="grid grid-cols-2 gap-6 rounded-2xl border border-line bg-white p-6 shadow-lift">
                          <div>
                            <p className="eyebrow mb-3">Collections</p>
                            <ul className="space-y-1">
                              {collections.map((c) => (
                                <li key={c.slug}>
                                  <Link href={`/collections/${c.slug}`} className="block rounded-lg px-2 py-1.5 text-sm text-ink-soft hover:bg-cream hover:text-ink">
                                    {c.name}
                                  </Link>
                                </li>
                              ))}
                              <li>
                                <Link href="/collections" className="block rounded-lg px-2 py-1.5 text-sm font-medium text-bronze-deep hover:bg-cream">
                                  All collections →
                                </Link>
                              </li>
                            </ul>
                          </div>
                          <div>
                            <p className="eyebrow mb-3">Shop by category</p>
                            <ul className="space-y-1">
                              {categories.map((c) => (
                                <li key={c.slug}>
                                  <Link href={`/${c.slug}`} className="block rounded-lg px-2 py-1.5 text-sm text-ink-soft hover:bg-cream hover:text-ink">
                                    {c.name}
                                  </Link>
                                </li>
                              ))}
                              <li>
                                <Link href="/shop" className="block rounded-lg px-2 py-1.5 text-sm font-medium text-bronze-deep hover:bg-cream">
                                  Shop all →
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              ) : (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "group relative block rounded-full px-4 py-2 text-[0.9rem] font-medium transition-colors",
                      transparent ? "text-white/90 hover:text-white" : "text-ink-soft hover:text-ink",
                      item.name === "Sale" && !transparent && "text-danger hover:text-danger",
                    )}
                  >
                    {item.name}
                    <span
                      className={cn(
                        "absolute inset-x-4 bottom-1 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100",
                        transparent ? "bg-white" : "bg-ink",
                        isActive(item.href) && "scale-x-100",
                      )}
                    />
                  </Link>
                </li>
              ),
            )}
          </ul>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-0.5 lg:ml-0">
            <button type="button" className={iconBtn} aria-label="Search products" onClick={() => setSearchOpen(true)}>
              <Search className="h-[20px] w-[20px]" strokeWidth={1.7} />
            </button>
            <Link href="/account" className={cn(iconBtn, "hidden sm:flex")} aria-label="Account">
              <User className="h-[20px] w-[20px]" strokeWidth={1.7} />
            </Link>
            <Link href="/wishlist" className={cn(iconBtn, "hidden sm:flex")} aria-label={`Wishlist, ${wishlistCount} saved`}>
              <Heart className="h-[20px] w-[20px]" strokeWidth={1.7} />
              <CountBadge count={wishlistCount} />
            </Link>
            <button type="button" className={iconBtn} aria-label={`Shopping bag, ${cartCount} items`} onClick={openDrawer}>
              <ShoppingBag className="h-[20px] w-[20px]" strokeWidth={1.7} />
              <CountBadge count={cartCount} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-[80] lg:hidden" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
            <motion.button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-ink/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-0 flex w-[min(86vw,360px)] flex-col overflow-y-auto bg-ivory"
            >
              <div className="flex h-[68px] items-center justify-between border-b border-line px-4">
                <ExepraLogo className="text-[26px]" />
                <button type="button" onClick={() => setMenuOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-cream" aria-label="Close menu" autoFocus>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ul className="px-2 py-4">
                {PRIMARY.filter((i) => !("dropdown" in i)).map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className={cn("flex items-center justify-between rounded-xl px-4 py-3.5 font-display text-lg font-medium", item.name === "Sale" ? "text-danger" : "text-ink")}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-line px-6 py-5">
                <p className="eyebrow mb-3">Categories</p>
                <ul className="space-y-2.5">
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/${c.slug}`} className="text-[0.95rem] text-ink-soft">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/shop" className="text-[0.95rem] text-ink-soft">
                      Shop all
                    </Link>
                  </li>
                </ul>
                {collections.length > 0 && (
                  <>
                    <p className="eyebrow mb-3 mt-6">Collections</p>
                    <ul className="space-y-2.5">
                      {collections.map((c) => (
                        <li key={c.slug}>
                          <Link href={`/collections/${c.slug}`} className="text-[0.95rem] text-ink-soft">
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <div className="mt-auto grid grid-cols-2 gap-2 border-t border-line p-4">
                <Link href="/account" className="flex items-center justify-center gap-2 rounded-full border border-line bg-white py-3 text-sm font-medium">
                  <User className="h-4 w-4" /> Account
                </Link>
                <Link href="/wishlist" className="flex items-center justify-center gap-2 rounded-full border border-line bg-white py-3 text-sm font-medium">
                  <Heart className="h-4 w-4" /> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} categories={categories} />
    </>
  );
}
