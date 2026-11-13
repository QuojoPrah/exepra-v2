"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ActionState = { status: "idle" | "success" | "error"; message: string; errors?: Record<string, string> };
export const idle: ActionState = { status: "idle", message: "" };

export function Notice({ state }: { state: ActionState }) {
  if (state.status === "idle" || !state.message) return null;
  return (
    <p className={cn("rounded-xl px-4 py-3 text-sm", state.status === "success" ? "bg-success/10 text-success" : "bg-danger/10 text-danger")} role={state.status === "error" ? "alert" : "status"}>
      {state.message}
    </p>
  );
}

/** Form bound to a server action with inline success/error feedback. */
export function ActionForm({
  action,
  children,
  submitLabel = "Save",
  className,
  resetOnSuccess = false,
  confirm,
  variant = "primary",
  onSuccess,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  children?: React.ReactNode | ((state: ActionState) => React.ReactNode);
  submitLabel?: string;
  className?: string;
  resetOnSuccess?: boolean;
  confirm?: string;
  variant?: "primary" | "outline" | "danger" | "ghost";
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, idle);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "success") {
      if (resetOnSuccess) ref.current?.reset();
      onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return (
    <form
      ref={ref}
      action={formAction}
      className={cn("space-y-4", className)}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {typeof children === "function" ? children(state) : children}
      <Notice state={state} />
      <Button type="submit" variant={variant} loading={pending}>{submitLabel}</Button>
    </form>
  );
}

export function F({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  hint,
  error,
  className,
  ...rest
}: { label: string; name: string; defaultValue?: string | number | null; type?: string; required?: boolean; hint?: string; error?: string; className?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue">) {
  return (
    <div className={className}>
      <label htmlFor={`adm-${name}`} className="label">{label}</label>
      <input id={`adm-${name}`} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} className="field h-11" aria-invalid={Boolean(error) || undefined} {...rest} />
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function TA({ label, name, defaultValue, rows = 4, hint, className, required }: { label: string; name: string; defaultValue?: string | null; rows?: number; hint?: string; className?: string; required?: boolean }) {
  return (
    <div className={className}>
      <label htmlFor={`adm-${name}`} className="label">{label}</label>
      <textarea id={`adm-${name}`} name={name} rows={rows} defaultValue={defaultValue ?? ""} required={required} className="field" />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Check({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2.5 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-[#1f1d1b]" /> {label}
    </label>
  );
}

export async function uploadFile(file: File, folder: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  return data.url;
}

/** Single image field: upload or paste a URL; submits as a hidden input. */
export function ImageField({ name, label, defaultValue, folder = "general" }: { name: string; label: string; defaultValue?: string | null; folder?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <p className="label">{label}</p>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-start gap-4">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-cream">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-taupe" aria-hidden />}
          {url && (
            <button type="button" onClick={() => setUrl("")} className="absolute right-1 top-1 rounded-full bg-white/90 p-1" aria-label="Remove image"><X className="h-3 w-3" /></button>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm hover:border-ink/40">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} Upload image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setBusy(true);
                setError(null);
                try {
                  setUrl(await uploadFile(f, folder));
                } catch (err) {
                  setError((err as Error).message);
                } finally {
                  setBusy(false);
                  e.target.value = "";
                }
              }}
            />
          </label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/images/... or https://res.cloudinary.com/..." className="field h-9 text-xs" aria-label={`${label} URL`} />
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Card({ title, children, className, actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-white p-5 sm:p-6", className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-semibold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
