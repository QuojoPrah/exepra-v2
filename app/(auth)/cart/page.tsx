"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";

type CartItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  price: number;
  quantity: number;
};

const CART_STORAGE_KEY = "exepra-cart-v2";
const VAT_RATE = 0.19;

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  /* ---------------------------------------------
     Load cart
  --------------------------------------------- */

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch {
      setCart([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  /* ---------------------------------------------
     Save cart
  --------------------------------------------- */

  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cart)
    );
  }, [cart, isLoaded]);

  /* ---------------------------------------------
     Calculations
  --------------------------------------------- */

  const itemCount = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );
  }, [cart]);

  const shipping = 0;

  const discountAmount = Math.min(
    discount,
    subtotal
  );

  const total = Math.max(
    0,
    subtotal - discountAmount + shipping
  );

  const vatAmount =
    total - total / (1 + VAT_RATE);

  /* ---------------------------------------------
     Currency
  --------------------------------------------- */

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  /* ---------------------------------------------
     Quantity
  --------------------------------------------- */

  const updateQuantity = (
    id: string,
    change: number
  ) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          quantity: Math.max(
            1,
            item.quantity + change
          ),
        };
      })
    );
  };

  /* ---------------------------------------------
     Remove
  --------------------------------------------- */

  const removeItem = (id: string) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.id !== id
      )
    );
  };

  /* ---------------------------------------------
     Clear cart
  --------------------------------------------- */

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCoupon("");
    setCouponMessage("");
  };

  /* ---------------------------------------------
     Coupon
  --------------------------------------------- */

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();

    if (!code) {
      setCouponMessage(
        "Please enter a coupon code."
      );
      return;
    }

    /*
      Demo coupon.
      Later this will connect to your backend.
    */

    if (code === "EXEPRA10") {
      const amount = subtotal * 0.1;

      setDiscount(amount);
      setCouponMessage(
        "10% discount applied."
      );
    } else {
      setDiscount(0);
      setCouponMessage(
        "Invalid coupon code."
      );
    }
  };

  /* ---------------------------------------------
     Loading
  --------------------------------------------- */

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] px-6 pb-24 pt-32">

        <div className="mx-auto max-w-7xl animate-pulse">

          <div className="mx-auto h-12 w-64 rounded-xl bg-slate-200" />

          <div className="mx-auto mt-4 h-5 w-80 rounded-lg bg-slate-200" />

          <div className="mt-14 grid gap-10 lg:grid-cols-[1.7fr_0.8fr]">

            <div className="h-[500px] rounded-[28px] bg-white" />

            <div className="h-[420px] rounded-[28px] bg-white" />

          </div>

        </div>

      </main>
    );
  }

  /* ---------------------------------------------
     Empty Cart
  --------------------------------------------- */

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] px-6 pb-24 pt-32">

        <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center text-center">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">

            <ShoppingBag
              className="h-8 w-8 text-slate-400"
              strokeWidth={1.6}
            />

          </div>

          <p className="mt-7 text-xs font-medium uppercase tracking-[0.22em] text-yellow-700">
            Exepra
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Your Shopping Cart
          </h1>

          <p className="mt-4 max-w-md text-base leading-7 text-slate-500">
            Your cart is currently empty. Discover something
            you love and start shopping with Exepra.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-yellow-700 px-7 py-4 font-medium text-white shadow-lg shadow-yellow-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-black"
          >
            Continue Shopping

            <ArrowLeft
              className="h-4 w-4 rotate-180"
            />
          </Link>

        </div>

      </main>
    );
  }

  /* ---------------------------------------------
     Main Cart
  --------------------------------------------- */

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-4 pb-24 pt-28 sm:px-6 sm:pt-32">

      <div className="mx-auto max-w-7xl">

        {/* ---------------------------------------
            PAGE HEADER
        --------------------------------------- */}

        <div className="text-center">

          <p className="text-xs font-medium uppercase tracking-[0.25em] text-yellow-700">
            Exepra
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Shopping Cart
          </h1>

          <p className="mt-3 text-base text-slate-500">
            Review your selection before checkout.
          </p>

        </div>

        {/* ---------------------------------------
            CART GRID
        --------------------------------------- */}

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">

          {/* =====================================
              LEFT
          ===================================== */}

          <section>

            {/* Desktop table header */}

            <div className="hidden border-b border-slate-200 px-5 pb-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 md:grid md:grid-cols-[minmax(0,1fr)_110px_120px_120px_35px] md:items-center md:gap-5">

              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Subtotal</span>
              <span />

            </div>

            {/* Product rows */}

            <div className="divide-y divide-slate-200 rounded-[28px] bg-white px-4 shadow-sm sm:px-6">

              {cart.map((item) => (

                <article
                  key={item.id}
                  className="py-6 md:grid md:grid-cols-[minmax(0,1fr)_110px_120px_120px_35px] md:items-center md:gap-5"
                >

                  {/* Product */}

                  <div className="flex min-w-0 items-center gap-4">

                    <Link
                      href={`/products/${item.id}`}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#F7F7F5] sm:h-28 sm:w-28"
                    >

                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="112px"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />

                    </Link>

                    <div className="min-w-0">

                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-yellow-700">
                        {item.category}
                      </p>

                      <Link
                        href={`/products/${item.id}`}
                        className="mt-1 block truncate text-base font-semibold text-slate-900 transition hover:text-yellow-700 sm:text-lg"
                      >
                        {item.name}
                      </Link>

                      <p className="mt-1 hidden max-w-sm truncate text-sm text-slate-400 sm:block">
                        {item.description}
                      </p>

                      {/* Mobile price */}

                      <p className="mt-3 font-semibold text-slate-900 md:hidden">
                        {formatPrice(item.price)}
                      </p>

                    </div>

                  </div>

                  {/* Desktop price */}

                  <div className="mt-5 hidden text-sm font-medium text-slate-700 md:block">
                    {formatPrice(item.price)}
                  </div>

                  {/* Quantity */}

                  <div className="mt-5 flex items-center justify-between md:mt-0 md:block">

                    <span className="text-xs font-medium uppercase tracking-wider text-slate-400 md:hidden">
                      Quantity
                    </span>

                    <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white">

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, -1)
                        }
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                        className="flex h-9 w-9 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="flex h-9 w-9 items-center justify-center border-x border-slate-200 text-sm font-medium text-slate-900">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, 1)
                        }
                        aria-label="Increase quantity"
                        className="flex h-9 w-9 items-center justify-center text-slate-600 transition hover:bg-slate-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>

                    </div>

                  </div>

                  {/* Subtotal */}

                  <div className="mt-5 flex items-center justify-between md:mt-0 md:block">

                    <span className="text-xs font-medium uppercase tracking-wider text-slate-400 md:hidden">
                      Subtotal
                    </span>

                    <span className="font-semibold text-slate-900">
                      {formatPrice(
                        item.price * item.quantity
                      )}
                    </span>

                  </div>

                  {/* Remove */}

                  <button
                    type="button"
                    onClick={() =>
                      removeItem(item.id)
                    }
                    aria-label={`Remove ${item.name}`}
                    className="absolute right-5 mt-[-120px] rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 md:static md:mt-0"
                  >
                    <Trash2
                      className="h-4 w-4"
                      strokeWidth={1.8}
                    />
                  </button>

                </article>

              ))}

            </div>

            {/* -----------------------------------
                COUPON + CLEAR
            ----------------------------------- */}

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex flex-col gap-2 sm:flex-row">

                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) =>
                      setCoupon(e.target.value)
                    }
                    placeholder="Coupon code"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-yellow-700 focus:ring-4 focus:ring-yellow-700/10 sm:w-52"
                  />

                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="h-12 rounded-xl bg-yellow-700 px-6 text-sm font-medium text-white transition hover:bg-black"
                  >
                    Apply Coupon
                  </button>

                </div>

                {couponMessage && (
                  <p className="mt-2 text-xs text-slate-500">
                    {couponMessage}
                  </p>
                )}

              </div>

              <button
                type="button"
                onClick={clearCart}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Clear Shopping Cart
              </button>

            </div>

            {/* Continue */}

            <Link
              href="/"
              className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-yellow-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>

          </section>

          {/* =====================================
              RIGHT — SUMMARY
          ===================================== */}

          <aside>

            <div className="lg:sticky lg:top-28">

              <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

                <h2 className="text-xl font-semibold text-slate-900">
                  Order Summary
                </h2>

                <div className="my-6 h-px bg-slate-200" />

                <div className="space-y-5">

                  <div className="flex justify-between text-sm text-slate-500">

                    <span>
                      Items ({itemCount})
                    </span>

                    <span className="font-medium text-slate-900">
                      {formatPrice(subtotal)}
                    </span>

                  </div>

                  <div className="flex justify-between text-sm text-slate-500">

                    <span>
                      Subtotal
                    </span>

                    <span className="font-medium text-slate-900">
                      {formatPrice(subtotal)}
                    </span>

                  </div>

                  <div className="flex justify-between text-sm text-slate-500">

                    <span>
                      Shipping
                    </span>

                    <span className="font-medium text-green-600">
                      Free
                    </span>

                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-slate-500">

                      <span>
                        Coupon Discount
                      </span>

                      <span className="font-medium text-green-600">
                        -{formatPrice(discountAmount)}
                      </span>

                    </div>
                  )}

                  <div className="flex justify-between text-sm text-slate-500">

                    <span>
                      VAT included (19%)
                    </span>

                    <span className="font-medium text-slate-900">
                      {formatPrice(vatAmount)}
                    </span>

                  </div>

                </div>

                <div className="my-6 h-px bg-slate-200" />

                <div className="flex items-center justify-between">

                  <span className="text-lg font-semibold text-slate-900">
                    Total
                  </span>

                  <span className="text-2xl font-bold tracking-tight text-slate-900">
                    {formatPrice(total)}
                  </span>

                </div>

                <p className="mt-1 text-right text-xs text-slate-400">
                  Including VAT
                </p>

                <Link
                  href="/checkout"
                  className="mt-7 flex h-14 w-full items-center justify-center rounded-xl bg-yellow-700 font-medium text-white shadow-lg shadow-yellow-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-black hover:shadow-xl"
                >
                  Proceed to Checkout
                </Link>

              </div>

              {/* --------------------------------
                  BENEFITS
              -------------------------------- */}

              <div className="mt-5 grid grid-cols-3 rounded-[24px] bg-white p-5 shadow-sm">

                <div className="flex flex-col items-center text-center">

                  <Truck
                    className="h-6 w-6 text-yellow-700"
                    strokeWidth={1.7}
                  />

                  <p className="mt-2 text-xs font-semibold text-slate-800">
                    Free Shipping
                  </p>

                  <p className="mt-1 hidden text-[10px] leading-4 text-slate-400 sm:block">
                    Fast & reliable
                  </p>

                </div>

                <div className="flex flex-col items-center border-x border-slate-100 text-center">

                  <ShieldCheck
                    className="h-6 w-6 text-yellow-700"
                    strokeWidth={1.7}
                  />

                  <p className="mt-2 text-xs font-semibold text-slate-800">
                    Secure Payment
                  </p>

                  <p className="mt-1 hidden text-[10px] leading-4 text-slate-400 sm:block">
                    Protected checkout
                  </p>

                </div>

                <div className="flex flex-col items-center text-center">

                  <RotateCcw
                    className="h-6 w-6 text-yellow-700"
                    strokeWidth={1.7}
                  />

                  <p className="mt-2 text-xs font-semibold text-slate-800">
                    Easy Returns
                  </p>

                  <p className="mt-1 hidden text-[10px] leading-4 text-slate-400 sm:block">
                    Shop confidently
                  </p>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}