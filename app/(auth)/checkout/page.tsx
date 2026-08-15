"use client";

import { LockKeyhole } from "lucide-react";
import { useState } from "react";

export default function CheckoutPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("card");

  return (
    <main className="min-h-screen bg-[#FAFAF8] py-32">

      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div>
          <h1 className="text-5xl font-semibold text-slate-900">
            Checkout
          </h1>

          <p className="mt-3 text-lg text-slate-500">
            Complete your order securely.
          </p>
        </div>

        {/* Checkout Layout */}
        <form
        onSubmit={(e) => e.preventDefault()} 
        className="mt-14 grid gap-10 lg:grid-cols-[1.5fr_0.8fr]">

          {/* Left Side */}
          <div className="space-y-8">

            {/* Contact Information */}
            <section className="rounded-[28px] bg-white p-8 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Contact Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Where should we send your order confirmation?
                  </p>
                </div>

              </div>

              <div className="mt-8">

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    py-4
                    text-slate-900
                    outline-none
                    transition
                    focus:border-slate-700
                    focus:ring-4
                    focus:ring-yellow-700/10
                  "
                />

              </div>

            </section>

            {/* Shipping Address */}
            <section className="rounded-[28px] bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-semibold text-slate-900">
                Shipping Address
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Where should we deliver your order?
              </p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-slate-200
                      px-5
                      py-4
                      outline-none
                      transition
                      focus:border-slate-700
                      focus:ring-4
                      focus:ring-yellow-700/10
                    "
                  />

                </div>

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Address
                  </label>

                  <input
                    type="text"
                    placeholder="Street and house number"
                    autoComplete="street-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-slate-200
                      px-5
                      py-4
                      outline-none
                      transition
                      focus:border-slate-700
                      focus:ring-4
                      focus:ring-yellow-700/10
                    "
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Postal Code
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. 66111"
                    autoComplete="postal-code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-slate-200
                      px-5
                      py-4
                      outline-none
                      transition
                      focus:border-slate-700
                      focus:ring-4
                      focus:ring-yellow-700/10
                    "
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    City
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your city"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-slate-200
                      px-5
                      py-4
                      outline-none
                      transition
                      focus:border-slate-700
                      focus:ring-4
                      focus:ring-yellow-700/10
                    "
                  />

                </div>

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Country
                  </label>

                  <select
                    defaultValue="Germany"
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      px-5
                      py-4
                      text-slate-900
                      outline-none
                      transition
                      focus:border-slate-700
                      focus:ring-4
                      focus:ring-yellow-700/10
                    "
                  >
                    <option>Germany</option>
                    <option>Austria</option>
                    <option>France</option>
                    <option>Netherlands</option>
                    <option>Belgium</option>
                  </select>

                </div>

              </div>

            </section>

            {/* Delivery */}
            <section className="rounded-[28px] bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-semibold text-slate-900">
                Delivery Method
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose how you would like to receive your order.
              </p>

              <div className="mt-8">

                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-yellow-700 bg-yellow-700/5 p-5">

                  <div className="flex items-center gap-4">

                    <input
                      type="radio"
                      name="delivery"
                      defaultChecked
                      className="h-5 w-5 accent-yellow-700"
                    />

                    <div>
                      <p className="font-medium text-slate-900">
                        Standard Delivery
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Delivered within 3–5 business days
                      </p>
                    </div>

                  </div>

                  <span className="font-medium text-green-600">
                    Free
                  </span>

                </label>

              </div>

            </section>

            {/* Payment Method */}
            <section className="rounded-[28px] bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-semibold text-slate-900">
                Payment Method
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose how you would like to pay.
              </p>

              <div className="mt-8 space-y-4">

                {/* Credit / Debit Card */}
                <label 
                className={`flex cursor-pointer items-center justify-between rounded-2xl p-5 transition-all duration-300 ${
                  paymentMethod === "card"
                  ? "border-yellow-700 bg-yellow-700/5"
                  : "border-slate-200 bg-white hover:border-slate-300"}`}
                  >

                  <div className="flex items-center gap-4">

                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="h-5 w-5 accent-yellow-700"
                    />

                    <div>
                      <p className="font-medium text-slate-900">
                        Credit / Debit Card
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Visa, Mastercard, American Express
                      </p>
                    </div>

                  </div>

                  <div className="text-sm font-semibold text-slate-700">
                    CARD
                  </div>

                </label>

                {paymentMethod === "card" && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-[#FAFAF8] p-6">

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Cardholder Name
                      </label>

                      <input
                        type="text"
                        placeholder="Name on card"
                        autoComplete="cc-name"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        required
                        className="
                          w-full
                          rounded-2xl
                          border
                          border-slate-200
                          bg-white
                          px-5
                          py-4
                          text-slate-900
                          outline-none
                          transition
                          focus:border-slate-700
                          focus:ring-4
                          focus:ring-yellow-700/10
                        "
                      />
                    </div>

                    <div className="mt-5">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Card Number
                      </label>

                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        autoComplete="cc-number"
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                        className="
                          w-full
                          rounded-2xl
                          border
                          border-slate-200
                          bg-white
                          px-5
                          py-4
                          text-slate-900
                          outline-none
                          transition
                          focus:border-slate-700
                          focus:ring-4
                          focus:ring-yellow-700/10
                        "
                      />
                    </div>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Expiry Date
                        </label>

                        <input
                          type="text"
                          placeholder="MM / YY"
                          autoComplete="cc-exp"
                          inputMode="numeric"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          required
                          className="
                            w-full
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            px-5
                            py-4
                            text-slate-900
                            outline-none
                            transition
                            focus:border-slate-700
                            focus:ring-4
                            focus:ring-yellow-700/10
                          "
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          CVV
                        </label>

                        <input
                          type="text"
                          placeholder="123"
                          autoComplete="cc-csc"
                          inputMode="numeric"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          required
                          className="
                            w-full
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            px-5
                            py-4
                            text-slate-900
                            outline-none
                            transition
                            focus:border-slate-700
                            focus:ring-4
                            focus:ring-yellow-700/10
                          "
                        />
                      </div>

                    </div>

                  </div>
                )}

                {/* PayPal */}
                <label className={`flex cursor-pointer items-center justify-between rounded-2xl p-5 transition-all duration-300 ${
                paymentMethod === "paypal"
                  ? "border-yellow-700 bg-yellow-700/5"
                  : "border-slate-200 bg-white hover:border-slate-300"}`}
                  >

                  <div className="flex items-center gap-4">

                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={() => setPaymentMethod("paypal")}
                      className="h-5 w-5 accent-yellow-700"
                    />

                    <div>
                      <p className="font-medium text-slate-900">
                        PayPal
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Pay securely with your PayPal account
                      </p>
                    </div>

                  </div>

                  <div className="text-sm font-semibold text-slate-700">
                    PayPal
                  </div>

                </label>

                {/* Apple Pay */}
                <label className={`flex cursor-pointer items-center justify-between rounded-2xl p-5 transition-all duration-300 ${paymentMethod === "applepay"
                ? "border-yellow-700 bg-yellow-700/5"
                : "border-slate-200 bg-white hover:border-slate-300"
                }`}>

                  <div className="flex items-center gap-4">

                    <input
                      type="radio"
                      name="payment"
                      value="applepay"
                      checked={paymentMethod === "applepay"}
                      onChange={() => setPaymentMethod("applepay")}
                      className="h-5 w-5 accent-yellow-700"
                    />

                    <div>
                      <p className="font-medium text-slate-900">
                        Apple Pay
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Fast and secure payment with Apple Pay
                      </p>
                    </div>

                  </div>

                  <div className="text-sm font-semibold text-slate-700">
                    Apple Pay
                  </div>

                </label>

              </div>

            </section>

          </div>

          {/* Right Side */}
          <div>

            <div className="sticky top-32 rounded-[28px] bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-semibold text-slate-900">
                Your Order
              </h2>

              {/* Product */}
              <div className="mt-8 flex items-center gap-4">

                <div className="h-20 w-20 overflow-hidden rounded-2xl bg-[#F7F7F5]">

                  <img
                    src="/images/products/shoes.png"
                    alt="Modern Lounge Chair"
                    className="h-full w-full object-cover"
                  />

                </div>

                <div className="flex-1">

                  <h3 className="font-medium text-slate-900">
                    Modern Lounge Chair
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Qty 1
                  </p>

                </div>

                <span className="font-semibold text-slate-900">
                  €249.00
                </span>

              </div>

              <div className="my-8 h-px bg-slate-200" />

              <div className="space-y-5">

                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>€249.00</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-green-600">
                    Free
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span>€47.31</span>
                </div>

                <div className="h-px bg-slate-200" />

                <div className="flex items-center justify-between">

                  <span className="text-lg font-semibold text-slate-900">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-slate-900">
                    €296.31
                  </span>

                </div>

              </div>

              <button
                type="button"
                onClick={() => {
                  if (!paymentMethod) {
                    return;
                  }

                  const form = document.querySelector("form");

                  if (form?.checkValidity()) {
                    alert("Checkout information is valid. Ready for payment.");
                  } else {
                    form?.reportValidity();
                  }
                }}
                className="
                  mt-8
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
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
                "
              >
                <LockKeyhole className="h-4 w-4" />
                Continue to Payment
              </button>

              <p className="mt-4 text-center text-sm text-slate-400">
                Secure checkout · Your information is protected
              </p>

            </div>

          </div>

        </form>

      </div>

    </main>
  );
}