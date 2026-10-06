"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CART_STORAGE_KEY = "exepra-cart-v2";

type CartItem = {
  id: number | string;
  name: string;
  category?: string;
  image: string;
  price: number;
  quantity: number;
};

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Germany");

  const [paymentMethod, setPaymentMethod] = useState("card");

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const vatIncluded = subtotal - subtotal / 1.19;

  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 4.99;

  const total = subtotal + shipping;

  const handleContinueToPayment = () => {
    const form = document.querySelector("form");

    if (form?.checkValidity()) {
      alert("Checkout information is valid. Ready for payment.");
    } else {
      form?.reportValidity();
    }
  };

  if (!isLoading && cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#f7f7f4] px-6 py-20">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white">
              <Check size={26} />
            </div>

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              EXEPRA
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              Your cart is empty
            </h1>

            <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-500">
              Add something beautiful to your cart before continuing to
              checkout.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex rounded-full bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-slate-950">
      {/* HEADER */}
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-[0.18em] text-slate-950"
          >
            EXEPRA
          </Link>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <LockKeyhole size={15} />
            <span>Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
        {/* TOP */}
        <div className="mb-12 text-center">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Back to cart
          </Link>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Checkout
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Complete your order.
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-500">
            Enter your details below and review your order before payment.
          </p>

          {/* Progress */}
          <div className="mt-8 flex items-center justify-center gap-3 text-xs font-medium">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-700 text-white">
                1
              </span>

              <span className="hidden sm:block text-slate-900">
                Information
              </span>
            </div>

            <span className="h-px w-8 bg-slate-300" />

            {/* Step 2 */}
            <div className="flex items-center gap-2 text-slate-400">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white">
                2
              </span>

              <span className="hidden sm:block">
                Payment
              </span>
            </div>

            <span className="h-px w-8 bg-slate-300" />

            {/* Step 3 */}
            <div className="flex items-center gap-2 text-slate-400">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white">
                3
              </span>

              <span className="hidden sm:block">
                Confirmation
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"
        >
          {/* LEFT */}
          <div className="space-y-6">
            {/* CONTACT */}
            <section className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-9">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    01
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    Contact information
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    We&apos;ll send your order confirmation here.
                  </p>
                </div>

                <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-slate-100 sm:flex">
                  <Check size={17} />
                </div>
              </div>

              <div className="mt-8">
                <label className="mb-2 block text-sm font-medium">
                  Email address
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
                />
              </div>
            </section>

            {/* SHIPPING */}
            <section className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                02
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Delivery information
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Where should we deliver your order?
              </p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Full name
                  </label>

                  <input
                    type="text"
                    placeholder="Your full name"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full rounded-md border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Street address
                  </label>

                  <input
                    type="text"
                    placeholder="Street and house number"
                    autoComplete="street-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full rounded-md border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Postal code
                  </label>

                  <input
                    type="text"
                    placeholder="66111"
                    autoComplete="postal-code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="w-full rounded-md border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    City
                  </label>

                  <input
                    type="text"
                    placeholder="Saarbrücken"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full rounded-md border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Country
                  </label>

                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950"
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

            {/* DELIVERY */}
            <section className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                03
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Delivery method
              </h2>

              <div className="mt-7 rounded-2xl border border-slate-950 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <input
                      type="radio"
                      name="delivery"
                      defaultChecked
                      className="mt-1 h-4 w-4 accent-slate-950"
                    />

                    <div>
                      <p className="text-sm font-semibold">
                        Standard delivery
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Delivered within 3–5 business days
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 text-sm font-semibold">
                    {shipping === 0
                      ? "Free"
                      : `€${shipping.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </section>

            {/* PAYMENT */}
            <section className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                04
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Payment
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Select your preferred payment method.
              </p>

              <div className="mt-7 space-y-3">
                {/* CARD */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full rounded-2xl border p-5 text-left transition ${
                    paymentMethod === "card"
                      ? "border-slate-950 bg-slate-50"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-4 w-4 rounded-full border ${
                          paymentMethod === "card"
                            ? "border-[5px] border-slate-950"
                            : "border-slate-400"
                        }`}
                      />

                      <span className="text-sm font-semibold">
                        Credit / Debit Card
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-slate-400">
                      VISA · MC
                    </span>
                  </div>
                </button>

                {paymentMethod === "card" && (
                  <div className="border border-slate-200 bg-[#fafaf8] p-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Cardholder name
                      </label>

                      <input
                        type="text"
                        placeholder="Name on card"
                        autoComplete="cc-name"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        required
                        className="w-full border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-slate-950"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium">
                        Card number
                      </label>

                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        autoComplete="cc-number"
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                        className="w-full border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-slate-950"
                      />
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Expiry
                        </label>

                        <input
                          type="text"
                          placeholder="MM / YY"
                          autoComplete="cc-exp"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          required
                          className="w-full border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-slate-950"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">
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
                          className="w-full border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-slate-950"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PAYPAL */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  className={`w-full rounded-2xl border p-5 text-left transition ${
                    paymentMethod === "paypal"
                      ? "border-slate-950 bg-slate-50"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-4 w-4 rounded-full border ${
                        paymentMethod === "paypal"
                          ? "border-[5px] border-slate-950"
                          : "border-slate-400"
                      }`}
                    />

                    <span className="text-sm font-semibold">
                      PayPal
                    </span>
                  </div>
                </button>

                {/* APPLE PAY */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("applepay")}
                  className={`w-full rounded-2xl border p-5 text-left transition ${
                    paymentMethod === "applepay"
                      ? "border-slate-950 bg-slate-50"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-4 w-4 rounded-full border ${
                        paymentMethod === "applepay"
                          ? "border-[5px] border-slate-950"
                          : "border-slate-400"
                      }`}
                    />

                    <span className="text-sm font-semibold">
                      Apple Pay
                    </span>
                  </div>
                </button>
              </div>
            </section>
          </div>

          {/* RIGHT / ORDER SUMMARY */}
          <aside>
            <div className="sticky top-8 rounded-2xl border border-slate-200 bg-white p-7 sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Order summary
                </h2>

                <span className="text-sm text-slate-400">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
              </div>

              <div className="mt-7 space-y-5">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-[#f5f5f2]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="rounded-md object-cover"
                      />

                      <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center bg-slate-950 px-1 text-[10px] font-semibold text-white">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {item.category || "Exepra Collection"}
                      </p>

                      <p className="mt-2 text-sm font-medium">
                        €{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-7 h-px bg-slate-200" />

              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">
                    €{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span
                    className={
                      shipping === 0
                        ? "font-medium text-emerald-600"
                        : "font-medium text-slate-900"
                    }
                  >
                    {shipping === 0
                      ? "Free"
                      : `€${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>VAT included</span>
                  <span className="font-medium text-slate-900">
                    €{vatIncluded.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="my-7 h-px bg-slate-200" />

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Total
                  </p>

                  <p className="mt-1 text-3xl font-semibold tracking-tight">
                    €{total.toFixed(2)}
                  </p>
                </div>

                <span className="text-xs text-slate-400">
                  incl. VAT
                </span>
              </div>

              <button
                type="button"
                onClick={handleContinueToPayment}
                className="mt-7 flex w-full rounded-md items-center justify-center gap-2 bg-yellow-700 px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <LockKeyhole size={16} />
                Continue to Payment
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={15} />
                Secure & Protected
              </div>
            </div>
          </aside>
        </form>

        {/* TRUST BAR */}
        <div className="mt-12 grid rounded-xl border-y border-slate-200 bg-white sm:grid-cols-3">
          <div className="flex items-center justify-center gap-3 border-b border-slate-200 px-6 py-6 text-sm text-slate-600 sm:border-b-0 sm:border-r">
            <ShieldCheck size={19} />
            Secure checkout
          </div>

          <div className="flex items-center justify-center gap-3 border-b border-slate-200 px-6 py-6 text-sm text-slate-600 sm:border-b-0 sm:border-r">
            <Check size={18} />
            Easy returns
          </div>

          <div className="flex items-center justify-center gap-3 px-6 py-6 text-sm text-slate-600">
            <LockKeyhole size={18} />
            Protected information
          </div>
        </div>
      </div>
    </main>
  );
}