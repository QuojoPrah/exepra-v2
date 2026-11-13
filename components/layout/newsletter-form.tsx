"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { subscribeToNewsletter, type NewsletterState } from "@/app/actions/newsletter";
import { NEWSLETTER_CONSENT_TEXT } from "@/lib/consent";

const initial: NewsletterState = { status: "idle", message: "" };

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeToNewsletter, initial);

  if (state.status === "success") {
    return (
      <p className="flex items-start gap-3 rounded-2xl bg-white/[0.06] p-4 text-sm text-white" role="status">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-bronze" aria-hidden />
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-3" noValidate>
      <input type="hidden" name="source" value="footer" />
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your email address"
          aria-invalid={state.status === "error" || undefined}
          aria-describedby="newsletter-msg"
          className="h-12 min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.06] px-5 text-sm text-white outline-none placeholder:text-white/40 focus:border-bronze focus:ring-4 focus:ring-bronze/20"
        />
        <button type="submit" disabled={pending} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-ink transition hover:bg-sand disabled:opacity-60">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Subscribe
        </button>
      </div>
      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-white/60">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#a8834f]" />
        <span>
          {NEWSLETTER_CONSENT_TEXT} See our{" "}
          <Link href="/datenschutz" className="underline underline-offset-2 hover:text-white">
            privacy policy
          </Link>
          .
        </span>
      </label>
      <div id="newsletter-msg" className="min-h-[1rem]">
        {state.status === "error" && (
          <p className="text-xs text-[#f0a49c]" role="alert">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
