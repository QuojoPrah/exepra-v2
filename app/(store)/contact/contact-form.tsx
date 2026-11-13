"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { sendContactMessage, type ContactState } from "./actions";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContactMessage, { status: "idle", message: "" });
  if (state.status === "success") {
    return (
      <p className="flex gap-3 rounded-[var(--radius-card)] border border-line bg-white p-6 text-sm" role="status">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> {state.message}
      </p>
    );
  }
  const e = state.errors ?? {};
  const field = (name: string, label: string, type = "text", ac?: string) => (
    <div>
      <label htmlFor={`c-${name}`} className="label">{label}</label>
      <input id={`c-${name}`} name={name} type={type} autoComplete={ac} required className="field" aria-invalid={Boolean(e[name]) || undefined} />
      {e[name] && <p className="field-error">{e[name]}</p>}
    </div>
  );
  return (
    <form action={action} className="space-y-4 rounded-[var(--radius-card)] border border-line bg-white p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {field("name", "Name", "text", "name")}
        {field("email", "Email", "email", "email")}
      </div>
      {field("subject", "Subject")}
      <div>
        <label htmlFor="c-message" className="label">Message</label>
        <textarea id="c-message" name="message" rows={6} required className="field" aria-invalid={Boolean(e.message) || undefined} />
        {e.message && <p className="field-error">{e.message}</p>}
      </div>
      <div className="hidden" aria-hidden>
        <label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <p className="text-xs text-muted">We use your details only to answer your enquiry. See our <Link href="/datenschutz" className="underline">privacy policy</Link>.</p>
      {state.status === "error" && <p className="text-sm text-danger" role="alert">{state.message}</p>}
      <Button type="submit" size="lg" className="h-12" loading={pending}>Send message</Button>
    </form>
  );
}
