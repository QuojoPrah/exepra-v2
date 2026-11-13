"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, Check, ChevronLeft, Loader2, Lock, Pencil } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cancelPendingCheckout, quoteCheckout, startCheckout, type Quote } from "@/app/(store)/checkout/actions";
import { useCart } from "@/components/providers/store-providers";
import { Button, LinkButton } from "@/components/ui/button";
import ExepraLogo from "@/components/layout/ExepraLogo";
import { formatPrice } from "@/lib/money";
import { FALLBACK_IMAGE } from "@/lib/site";
import { addressSchema, emailSchema, fieldErrors, isValidPostalCode } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { z } from "zod";

type Address = {
  firstName: string;
  lastName: string;
  company: string;
  street: string;
  houseNumber: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
};

const emptyAddress = (country = "DE"): Address => ({ firstName: "", lastName: "", company: "", street: "", houseNumber: "", addressLine2: "", postalCode: "", city: "", country, phone: "" });

const STEPS = ["Information", "Shipping address", "Delivery", "Billing", "Payment"] as const;

const contactSchema = z.object({
  email: emailSchema,
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  phone: z.string().trim().regex(/^[+()\d\s/-]*$/, "Please enter a valid phone number.").optional().or(z.literal("")),
});

function Field({
  label,
  name,
  value,
  onChange,
  error,
  autoComplete,
  type = "text",
  required = true,
  className,
  inputMode,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
  type?: string;
  required?: boolean;
  className?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const id = `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
        {!required && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="field"
      />
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

function AddressFields({
  prefix,
  value,
  onChange,
  errors,
  countries,
  showCompany = false,
}: {
  prefix: "shipping" | "billing";
  value: Address;
  onChange: (a: Address) => void;
  errors: Record<string, string>;
  countries: { code: string; name: string }[];
  showCompany?: boolean;
}) {
  const set = (k: keyof Address) => (v: string) => onChange({ ...value, [k]: v });
  const err = (k: string) => errors[`${prefix}.${k}`];
  const ac = prefix === "shipping" ? "shipping" : "billing";
  return (
    <div className="grid grid-cols-6 gap-4">
      <Field className="col-span-6 sm:col-span-3" label="First name" name={`${prefix}-firstName`} value={value.firstName} onChange={set("firstName")} error={err("firstName")} autoComplete={`${ac} given-name`} />
      <Field className="col-span-6 sm:col-span-3" label="Last name" name={`${prefix}-lastName`} value={value.lastName} onChange={set("lastName")} error={err("lastName")} autoComplete={`${ac} family-name`} />
      {showCompany && <Field className="col-span-6" label="Company" name={`${prefix}-company`} value={value.company} onChange={set("company")} error={err("company")} autoComplete={`${ac} organization`} required={false} />}
      <Field className="col-span-4" label="Street" name={`${prefix}-street`} value={value.street} onChange={set("street")} error={err("street")} autoComplete={`${ac} address-line1`} />
      <Field className="col-span-2" label="No." name={`${prefix}-houseNumber`} value={value.houseNumber} onChange={set("houseNumber")} error={err("houseNumber")} />
      <Field className="col-span-6" label="Address line 2" name={`${prefix}-addressLine2`} value={value.addressLine2} onChange={set("addressLine2")} error={err("addressLine2")} autoComplete={`${ac} address-line2`} required={false} />
      <Field className="col-span-2" label="Postal code" name={`${prefix}-postalCode`} value={value.postalCode} onChange={set("postalCode")} error={err("postalCode")} autoComplete={`${ac} postal-code`} inputMode={value.country === "DE" ? "numeric" : undefined} />
      <Field className="col-span-4" label="City" name={`${prefix}-city`} value={value.city} onChange={set("city")} error={err("city")} autoComplete={`${ac} address-level2`} />
      <div className="col-span-6">
        <label htmlFor={`f-${prefix}-country`} className="label">
          Country
        </label>
        <select id={`f-${prefix}-country`} className="field" value={value.country} onChange={(e) => set("country")(e.target.value)} autoComplete={`${ac} country`}>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function CheckoutFlow({
  customer,
  savedAddresses,
  countries,
  paymentsEnabled,
  cancelledOrder,
}: {
  customer: { email: string; firstName: string; lastName: string; phone: string } | null;
  savedAddresses: (Address & { id: string })[];
  countries: { code: string; name: string }[];
  paymentsEnabled: boolean;
  cancelledOrder: string | null;
}) {
  const { cart, loading, refresh } = useCart();
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState({ email: customer?.email ?? "", firstName: customer?.firstName ?? "", lastName: customer?.lastName ?? "", phone: customer?.phone ?? "" });
  const [shipping, setShipping] = useState<Address>(() => {
    const saved = savedAddresses[0];
    if (saved) {
      const { id: _omit, ...rest } = saved;
      return rest;
    }
    return { ...emptyAddress(), firstName: customer?.firstName ?? "", lastName: customer?.lastName ?? "" };
  });
  const [billingSame, setBillingSame] = useState(true);
  const [billing, setBilling] = useState<Address>(emptyAddress());
  const [business, setBusiness] = useState(false);
  const [vatId, setVatId] = useState("");
  const [note, setNote] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelNotice, setCancelNotice] = useState(Boolean(cancelledOrder));

  useEffect(() => {
    if (!cancelledOrder) return;
    cancelPendingCheckout(cancelledOrder).finally(() => refresh());
  }, [cancelledOrder, refresh]);

  const applyQuote = useCallback((q: Quote | { error: string }) => {
    if ("error" in q) {
      setQuoteError(q.error);
      setQuote(null);
    } else {
      setQuoteError(null);
      setQuote(q);
      setShippingMethod(q.selected);
    }
  }, []);
  const loadQuote = useCallback((country: string, code: string | null) => quoteCheckout(country, code).then(applyQuote), [applyQuote]);

  const hasLines = Boolean(cart?.lines.length);
  useEffect(() => {
    if (!hasLines) return;
    let active = true;
    quoteCheckout(shipping.country, shippingMethod).then((q) => active && applyQuote(q));
    return () => {
      active = false;
    };
    // Re-quote when the destination or cart value changes; the chosen method is passed through.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipping.country, cart?.subtotal, cart?.discount, hasLines, applyQuote]);

  const validateStep = (s: number): boolean => {
    let result: Record<string, string> = {};
    if (s === 0) {
      const r = contactSchema.safeParse(contact);
      if (!r.success) result = fieldErrors(r.error);
    }
    if (s === 1) {
      const r = addressSchema.safeParse(shipping);
      if (!r.success) result = Object.fromEntries(Object.entries(fieldErrors(r.error)).map(([k, v]) => [`shipping.${k}`, v]));
    }
    if (s === 2 && !shippingMethod) result = { shippingMethod: "Please choose a delivery method." };
    if (s === 3) {
      if (!billingSame) {
        const r = addressSchema.safeParse(billing);
        if (!r.success) result = Object.fromEntries(Object.entries(fieldErrors(r.error)).map(([k, v]) => [`billing.${k}`, v]));
      }
      if (business && vatId && !/^[A-Za-z]{2}[A-Za-z0-9]{2,13}$/.test(vatId)) result.vatId = "Please enter a valid VAT ID (e.g. DE123456789).";
    }
    setErrors(result);
    if (Object.keys(result).length) {
      window.setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 30);
      return false;
    }
    return true;
  };

  const next = () => {
    const current = step;
    if (!validateStep(current)) return;
    if (current === 0 && !shipping.firstName && !shipping.lastName) {
      setShipping((a) => ({ ...a, firstName: contact.firstName, lastName: contact.lastName }));
    }
    setStep(Math.min(current + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pay = async () => {
    setFormError(null);
    if (!acceptTerms) {
      setErrors({ acceptTerms: "Please accept the terms and conditions." });
      return;
    }
    setSubmitting(true);
    const result = await startCheckout({
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
      shipping: { ...shipping, phone: shipping.phone || contact.phone },
      shippingMethod,
      billingSameAsShipping: billingSame,
      billing: billingSame ? undefined : billing,
      vatId: business ? vatId : "",
      customerNote: note,
      acceptTerms,
    });
    if ("url" in result) {
      window.location.assign(result.url);
      return;
    }
    setSubmitting(false);
    setFormError(result.error);
    if (result.fieldErrors) {
      setErrors(result.fieldErrors);
      const keys = Object.keys(result.fieldErrors);
      const target = keys.some((k) => k.startsWith("shipping.")) ? 1 : keys.some((k) => k.startsWith("billing.") || k === "vatId") ? 3 : keys.includes("shippingMethod") ? 2 : keys.some((k) => ["email", "firstName", "lastName", "phone"].includes(k)) ? 0 : step;
      setStep(target);
    }
    refresh();
  };

  const country = useMemo(() => countries.find((c) => c.code === shipping.country)?.name, [countries, shipping.country]);

  if (loading && !cart) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" aria-label="Loading" />
      </div>
    );
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        {cancelNotice && <p className="mb-6 rounded-xl bg-bronze-tint px-4 py-3 text-sm text-bronze-deep">Payment was cancelled — you have not been charged.</p>}
        <h1 className="text-3xl font-semibold">Your bag is empty</h1>
        <p className="mt-2 text-muted">Add something you love, then come back to check out.</p>
        <LinkButton href="/shop" className="mt-8">
          Continue shopping
        </LinkButton>
      </div>
    );
  }

  const summaryStep = (i: number, content: React.ReactNode) =>
    step > i && (
      <div className="flex items-start justify-between gap-4 rounded-xl border border-line bg-white px-5 py-4 text-sm">
        <div>
          <p className="font-medium">{STEPS[i]}</p>
          <div className="mt-1 text-muted">{content}</div>
        </div>
        <button type="button" onClick={() => setStep(i)} className="flex items-center gap-1 text-xs font-medium text-bronze-deep hover:underline" aria-label={`Edit ${STEPS[i]}`}>
          <Pencil className="h-3 w-3" /> Edit
        </button>
      </div>
    );

  const selectedOption = quote?.options.find((o) => o.code === shippingMethod);

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/cart" className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ChevronLeft className="h-4 w-4" /> Back to bag
        </Link>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Lock className="h-3.5 w-3.5" aria-hidden /> Secure checkout
        </span>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-14">
        <div>
          <h1 className="text-3xl font-semibold">Checkout</h1>

          <ol className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs" aria-label="Checkout progress">
            {STEPS.map((label, i) => (
              <li key={label} className={cn("flex items-center gap-2", i === step ? "font-semibold text-ink" : i < step ? "text-success" : "text-muted")} aria-current={i === step ? "step" : undefined}>
                <span className={cn("flex h-6 w-6 items-center justify-center rounded-full border text-[11px]", i === step ? "border-ink bg-ink text-white" : i < step ? "border-success bg-success text-white" : "border-line")}>
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {label}
              </li>
            ))}
          </ol>

          {cancelNotice && (
            <div className="mt-6 flex items-start justify-between gap-3 rounded-xl bg-bronze-tint px-4 py-3 text-sm text-bronze-deep" role="status">
              Payment was cancelled and you have not been charged. Your bag is still here.
              <button type="button" onClick={() => setCancelNotice(false)} className="text-xs underline">
                Dismiss
              </button>
            </div>
          )}

          <div className="mt-8 space-y-3">
            {summaryStep(0, `${contact.firstName} ${contact.lastName} · ${contact.email}`)}
            {summaryStep(1, `${shipping.street} ${shipping.houseNumber}, ${shipping.postalCode} ${shipping.city}, ${country}`)}
            {summaryStep(2, selectedOption ? `${selectedOption.name} · ${selectedOption.price === 0 ? "Free" : formatPrice(selectedOption.price)}` : "—")}
            {summaryStep(3, billingSame ? "Same as shipping address" : `${billing.firstName} ${billing.lastName}, ${billing.street} ${billing.houseNumber}, ${billing.postalCode} ${billing.city}`)}
          </div>

          {/* No exit animation: an outgoing step must never stay clickable with a stale handler. */}
          <motion.section key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mt-6 rounded-[var(--radius-card)] border border-line bg-white p-6 sm:p-8" aria-labelledby="step-title">
              <h2 id="step-title" className="mb-6 text-xl font-semibold">
                {step + 1}. {STEPS[step]}
              </h2>

              {step === 0 && (
                <div className="grid grid-cols-6 gap-4">
                  {!customer && (
                    <p className="col-span-6 -mt-2 mb-2 text-sm text-muted">
                      Checking out as a guest.{" "}
                      <Link href="/account/login?next=/checkout" className="font-medium text-ink underline underline-offset-2">
                        Sign in
                      </Link>{" "}
                      for faster checkout and order history.
                    </p>
                  )}
                  <Field className="col-span-6" label="Email" name="email" type="email" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} error={errors.email} autoComplete="email" inputMode="email" />
                  <Field className="col-span-6 sm:col-span-3" label="First name" name="firstName" value={contact.firstName} onChange={(v) => setContact({ ...contact, firstName: v })} error={errors.firstName} autoComplete="given-name" />
                  <Field className="col-span-6 sm:col-span-3" label="Last name" name="lastName" value={contact.lastName} onChange={(v) => setContact({ ...contact, lastName: v })} error={errors.lastName} autoComplete="family-name" />
                  <Field className="col-span-6" label="Phone (for delivery updates)" name="phone" type="tel" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} error={errors.phone} autoComplete="tel" required={false} />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  {savedAddresses.length > 0 && (
                    <div>
                      <label htmlFor="saved-address" className="label">
                        Saved addresses
                      </label>
                      <select
                        id="saved-address"
                        className="field"
                        onChange={(e) => {
                          const a = savedAddresses.find((x) => x.id === e.target.value);
                          if (a) {
                            const { id: _omit, ...rest } = a;
                            setShipping(rest);
                          }
                        }}
                        defaultValue={savedAddresses[0].id}
                      >
                        {savedAddresses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.firstName} {a.lastName}, {a.street} {a.houseNumber}, {a.city}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <AddressFields prefix="shipping" value={shipping} onChange={setShipping} errors={errors} countries={countries} showCompany />
                  {shipping.postalCode && !isValidPostalCode(shipping.country, shipping.postalCode) && !errors["shipping.postalCode"] && (
                    <p className="text-xs text-muted">Tip: German postal codes have 5 digits.</p>
                  )}
                </div>
              )}

              {step === 2 && (
                <fieldset>
                  <legend className="sr-only">Delivery method</legend>
                  {quoteError && <p className="mb-4 text-sm text-danger">{quoteError}</p>}
                  {!quote ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted" aria-label="Loading delivery options" />
                  ) : quote.options.length === 0 ? (
                    <p className="text-sm text-danger">Sorry, we don&apos;t currently deliver to {country}.</p>
                  ) : (
                    <div className="space-y-3">
                      {quote.options.map((o) => (
                        <label key={o.code} className={cn("flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition", shippingMethod === o.code ? "border-ink bg-ivory" : "border-line hover:border-ink/30")}>
                          <input
                            type="radio"
                            name="shippingMethod"
                            value={o.code}
                            checked={shippingMethod === o.code}
                            onChange={() => {
                              setShippingMethod(o.code);
                              loadQuote(shipping.country, o.code);
                            }}
                            className="h-4 w-4 accent-[#1f1d1b]"
                          />
                          <span className="flex-1">
                            <span className="block text-sm font-medium">{o.name}</span>
                            <span className="block text-xs text-muted">
                              {o.description ? `${o.description} · ` : ""}
                              {o.minDays}–{o.maxDays} business days
                            </span>
                          </span>
                          <span className="text-sm font-medium tabular-nums">{o.price === 0 ? "Free" : formatPrice(o.price)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {errors.shippingMethod && <p className="field-error">{errors.shippingMethod}</p>}
                  <p className="mt-5 text-sm text-muted">
                    Delivering to: {shipping.firstName} {shipping.lastName}, {shipping.street} {shipping.houseNumber}, {shipping.postalCode} {shipping.city}, {country}
                  </p>
                </fieldset>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <label className="flex items-center gap-3 text-sm">
                    <input type="checkbox" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} className="h-4 w-4 accent-[#1f1d1b]" />
                    Billing address is the same as shipping address
                  </label>
                  {!billingSame && <AddressFields prefix="billing" value={billing} onChange={setBilling} errors={errors} countries={countries} showCompany />}
                  <label className="flex items-center gap-3 text-sm">
                    <input type="checkbox" checked={business} onChange={(e) => setBusiness(e.target.checked)} className="h-4 w-4 accent-[#1f1d1b]" />
                    I&apos;m ordering for a business
                  </label>
                  {business && <Field label="VAT ID" name="vatId" value={vatId} onChange={setVatId} error={errors.vatId} required={false} />}
                  <div>
                    <label htmlFor="note" className="label">
                      Order note <span className="font-normal text-muted">(optional)</span>
                    </label>
                    <textarea id="note" className="field" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  {!paymentsEnabled && (
                    <p className="flex gap-2 rounded-xl bg-danger/10 p-4 text-sm text-danger">
                      <AlertCircle className="h-5 w-5 shrink-0" /> Online payment is not available yet. Please contact us to complete your order.
                    </p>
                  )}
                  <p className="text-sm leading-relaxed text-ink-soft">
                    You&apos;ll be redirected to our payment partner Stripe to pay securely. Available payment methods (e.g. card, PayPal, Klarna or SEPA, where enabled) are shown on the next page. Your order is confirmed once the payment has been received.
                  </p>
                  <label className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => {
                        setAcceptTerms(e.target.checked);
                        setErrors((er) => ({ ...er, acceptTerms: "" }));
                      }}
                      className="mt-0.5 h-4 w-4 accent-[#1f1d1b]"
                      aria-invalid={Boolean(errors.acceptTerms) || undefined}
                    />
                    <span>
                      I have read and accept the{" "}
                      <Link href="/agb" target="_blank" className="underline underline-offset-2">
                        terms and conditions
                      </Link>{" "}
                      and the{" "}
                      <Link href="/widerrufsbelehrung" target="_blank" className="underline underline-offset-2">
                        cancellation policy
                      </Link>
                      . Information on data processing can be found in our{" "}
                      <Link href="/datenschutz" target="_blank" className="underline underline-offset-2">
                        privacy policy
                      </Link>
                      .
                    </span>
                  </label>
                  {errors.acceptTerms && <p className="field-error">{errors.acceptTerms}</p>}
                </div>
              )}

              {formError && (
                <p className="mt-6 flex gap-2 rounded-xl bg-danger/10 p-4 text-sm text-danger" role="alert">
                  <AlertCircle className="h-5 w-5 shrink-0" /> {formError}
                </p>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                {step > 0 ? (
                  <Button variant="ghost" onClick={() => setStep(step - 1)}>
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                ) : (
                  <span />
                )}
                {step < STEPS.length - 1 ? (
                  <Button size="lg" className="h-12" onClick={next}>
                    Continue to {STEPS[step + 1].toLowerCase()}
                  </Button>
                ) : (
                  <Button size="lg" className="h-12" onClick={pay} loading={submitting} disabled={!paymentsEnabled || cart.hasIssues}>
                    <Lock className="h-4 w-4" /> Buy now · {formatPrice(quote?.total ?? cart.total)}
                  </Button>
                )}
              </div>
          </motion.section>
        </div>

        <aside className="h-fit rounded-[var(--radius-card)] border border-line bg-white p-6 lg:sticky lg:top-28" aria-label="Order summary">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <ul className="mt-5 space-y-4">
            {cart.lines.map((l) => (
              <li key={l.id} className="flex gap-3">
                <span className="relative h-18 w-15 shrink-0 overflow-hidden rounded-lg bg-cream">
                  <Image src={l.image ?? FALLBACK_IMAGE} alt="" fill sizes="60px" className="object-cover" />
                  <span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center rounded-bl-lg bg-ink px-1 text-[10px] font-semibold text-white">{l.quantity}</span>
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="block font-medium">{l.name}</span>
                  {l.variantLabel && <span className="block text-xs text-muted">{l.variantLabel}</span>}
                  {l.issue && <span className="block text-xs text-danger">Please review in your bag</span>}
                </span>
                <span className="text-sm tabular-nums">{formatPrice(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(quote?.subtotal ?? cart.subtotal)}</dd>
            </div>
            {(quote?.discount ?? cart.discount) > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount {cart.couponCode && `(${cart.couponCode})`}</dt>
                <dd className="tabular-nums">−{formatPrice(quote?.discount ?? cart.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="tabular-nums">{(quote?.shipping ?? cart.shipping) === 0 ? "Free" : formatPrice(quote?.shipping ?? cart.shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(quote?.total ?? cart.total)}</dd>
            </div>
            <p className="text-xs text-muted">Includes {formatPrice(quote?.tax ?? cart.tax)} VAT</p>
          </dl>
          <div className="mt-6 hidden border-t border-line pt-5 lg:block">
            <ExepraLogo className="text-xl" />
          </div>
        </aside>
      </div>
    </div>
  );
}
