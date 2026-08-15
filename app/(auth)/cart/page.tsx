"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ArrowLeft, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const [quantity, setQuantity] = useState(1);
  const [isRemoved, setIsRemoved] = useState(false);

  return (
    <main className="min-h-screen bg-[#FAFAF8] py-32">

      <div className="mx-auto max-w-7xl px-6">

        <h1 className="text-5xl font-semibold text-slate-900">
          Shopping Cart
        </h1>

        <p className="mt-3 text-lg text-slate-500">
          Review your items before checkout.
        </p>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.7fr_0.8fr]">

          {/* Cart Items */}

          <div className="space-y-6">
            {!isRemoved && (

            <div className="flex items-center gap-6 rounded-[28px] bg-white p-6 shadow-sm">

              {/* Product Image */}
              <div className="relative h-36 w-36 overflow-hidden rounded-2xl bg-[#F7F7F5]">

                <img
                  src="/images/products/shoes.png"
                  alt="Modern Lounge Chair"
                  className="h-full w-full object-cover"
                />

              </div>

              {/* Product Info */}
              <div className="flex flex-1 flex-col">

                <span className="text-sm uppercase tracking-widest text-yellow-700">
                  Home & Living
                </span>

                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Modern Lounge Chair
                </h2>

                <p className="mt-2 text-slate-500">
                  Premium comfort with timeless Scandinavian design.
                </p>

                <div className="mt-5 flex items-center justify-between">

                  <span className="text-3xl font-bold text-slate-900">
                    €{249 * quantity}
                  </span>

                  <div className="flex items-center gap-3">

                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      aria-label="Decrease quantity"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-lg transition hover:bg-slate-100"
                      >
                      <Minus className="h-4 w-4" strokeWidth={2} />
                    </button>

                    <span className="w-6 text-center text-sm font-medium text-slate-900">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => setQuantity((current) => current + 1)}
                      aria-label="Increase quantity"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-lg transition hover:bg-slate-100"
                      >
                      <Plus className="h-4 w-4" strokeWidth={2} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRemoved(true)}
                      aria-label="Remove item"
                      className="ml-4 text-sm font-medium text-red-500 transition hover:text-red-700"
                    >
                      Remove
                    </button>

                  </div>

                </div>
              </div>
            </div>
            )}

            {isRemoved && (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] bg-white p-10 text-center shadow-sm">

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F7F7F5]">
                  <ShoppingBag className="h-7 w-7 text-slate-400" strokeWidth={1.8} />
                </div>

                <h2 className="mt-6 text-2xl font-semibold text-slate-900">
                  Your cart is empty
                </h2>

                <p className="mt-3 max-w-sm text-slate-500">
                  Looks like you haven't added anything to your cart yet.
                </p>

                <Link
                  href="/"
                  className="mt-8 inline-flex items-center rounded-2xl bg-yellow-700 px-7 py-3.5 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-black"
                >
                  Continue Shopping
                </Link>

              </div>
            )}

            {!isRemoved && (
            <Link
              href="/"
              className="inline-flex text-sm font-medium text-slate-700 transition hover:text-yellow-700"
             >
              <span className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                Continue Shopping
              </span>
            </Link>
            )}
          
          </div>

          {/* Summary */}
          {!isRemoved && (
          <div>
            <div className="sticky top-32 rounded-[28px] bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-semibold text-slate-900">
                Order Summary
              </h2>

              <div className="mt-8 space-y-5">

                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>€{(249.00 * quantity).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Tax</span>
                  <span>€{(249 * quantity * 0.19).toFixed(2)}</span>
                </div>

                <div className="h-px bg-slate-200" />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-semibold text-slate-900">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-slate-900">
                    €{(249 * quantity * 1.19).toFixed(2)}
                  </span>
                </div>

              </div>

              <Link
                href="/checkout"
                className="
                  mt-8
                  flex
                  items-center
                  justify-center
                  w-full
                  rounded-2xl
                  bg-yellow-700
                  py-4
                  font-medium
                  text-white
                  shadow-lg
                  shadow-slate-900/10
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-black
                  hover:shadow-xl
                  active:translate-y-0
                "
              >
                Proceed to Checkout
              </Link>

              <p className="mt-4 text-center text-sm text-slate-400">
                Secure checkout · Fast delivery · Easy returns
              </p>

            </div>
          </div>
          )}

        </div>

      </div>

    </main>
  );
}