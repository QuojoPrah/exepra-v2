"use client";

import { MotionConfig } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartView } from "@/lib/cart";

// ───────────── Cart ─────────────

type MutationResult = { ok: true } | { ok: false; error: string };

type CartContextValue = {
  cart: CartView | null;
  count: number;
  loading: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  add: (variantId: string, quantity?: number, opts?: { openDrawer?: boolean }) => Promise<MutationResult>;
  setQuantity: (variantId: string, quantity: number) => Promise<MutationResult>;
  applyCoupon: (code: string | null) => Promise<MutationResult>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

async function postCart(body: unknown): Promise<{ cart?: CartView; error?: string }> {
  try {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error ?? "Something went wrong.", cart: data.cart };
    return { cart: data };
  } catch {
    return { error: "Network error — please check your connection and try again." };
  }
}

function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartView | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (res.ok) setCart(await res.json());
    } catch {
      /* keep last known cart */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/cart", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => active && data && setCart(data))
      .catch(() => undefined)
      .finally(() => active && setLoading(false));
    const onFocus = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refresh]);

  const mutate = useCallback(async (body: unknown): Promise<MutationResult> => {
    const { cart: next, error } = await postCart(body);
    if (next) setCart(next);
    return error ? { ok: false, error } : { ok: true };
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      count: cart?.count ?? 0,
      loading,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      add: async (variantId, quantity = 1, opts) => {
        const r = await mutate({ action: "add", variantId, quantity });
        if (r.ok && opts?.openDrawer !== false) setDrawerOpen(true);
        return r;
      },
      setQuantity: (variantId, quantity) => mutate({ action: "set", variantId, quantity }),
      applyCoupon: (code) => mutate({ action: "coupon", code }),
      refresh,
    }),
    [cart, loading, drawerOpen, mutate, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within StoreProviders");
  return ctx;
}

// ───────────── Wishlist ─────────────

type WishlistContextValue = {
  ids: Set<string>;
  count: number;
  has: (productId: string) => boolean;
  toggle: (productId: string, saved?: boolean) => Promise<MutationResult>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/wishlist", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { ids: [] }))
      .then((d) => setIds(new Set(d.ids)))
      .catch(() => undefined);
  }, []);

  const toggle = useCallback(async (productId: string, saved?: boolean): Promise<MutationResult> => {
    const desired = saved ?? !ids.has(productId);
    // optimistic update
    setIds((prev) => {
      const next = new Set(prev);
      if (desired) next.add(productId);
      else next.delete(productId);
      return next;
    });
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, saved: desired }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIds(new Set(data.ids));
      return { ok: true };
    } catch {
      setIds((prev) => {
        const next = new Set(prev);
        if (desired) next.delete(productId);
        else next.add(productId);
        return next;
      });
      return { ok: false, error: "Could not update your wishlist." };
    }
  }, [ids]);

  const value = useMemo(() => ({ ids, count: ids.size, has: (id: string) => ids.has(id), toggle }), [ids, toggle]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within StoreProviders");
  return ctx;
}

// ───────────── Quick view & toasts ─────────────

type UIContextValue = {
  quickViewSlug: string | null;
  openQuickView: (slug: string) => void;
  closeQuickView: () => void;
  toast: { id: number; message: string; tone: "default" | "error" } | null;
  notify: (message: string, tone?: "default" | "error") => void;
};

const UIContext = createContext<UIContextValue | null>(null);

function UIProvider({ children }: { children: React.ReactNode }) {
  const [quickViewSlug, setSlug] = useState<string | null>(null);
  const [toast, setToast] = useState<UIContextValue["toast"]>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const value = useMemo<UIContextValue>(
    () => ({
      quickViewSlug,
      openQuickView: setSlug,
      closeQuickView: () => setSlug(null),
      toast,
      notify: (message, tone = "default") => setToast({ id: Date.now(), message, tone }),
    }),
    [quickViewSlug, toast],
  );
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within StoreProviders");
  return ctx;
}

export function StoreProviders({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <UIProvider>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </UIProvider>
    </MotionConfig>
  );
}
