"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { passwordSchema } from "@/lib/validation";

function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

function PasswordInput({ id, name, autoComplete, value, onChange, invalid }: { id: string; name: string; autoComplete: string; value: string; onChange: (v: string) => void; invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} name={name} type={show ? "text" : "password"} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} required className="field pr-12" aria-invalid={invalid || undefined} />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-cream" aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

const authError = (msg?: string) =>
  msg?.toLowerCase().includes("invalid") ? "Incorrect email or password." : msg || "Something went wrong. Please try again.";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const { error } = await authClient.signIn.email({ email: email.trim().toLowerCase(), password, rememberMe: true });
    setPending(false);
    if (error) return setError(error.status === 429 ? "Too many attempts. Please wait a minute and try again." : authError(error.message));
    router.push(safeNext(params.get("next")));
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="field" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="label">Password</label>
          <Link href="/account/forgot-password" className="mb-1.5 text-xs font-medium text-bronze-deep hover:underline">Forgot password?</Link>
        </div>
        <PasswordInput id="password" name="password" autoComplete="current-password" value={password} onChange={setPassword} invalid={Boolean(error)} />
      </div>
      {error && <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">{error}</p>}
      <Button type="submit" size="lg" className="h-12 w-full" loading={pending}>Sign in</Button>
      <p className="text-center text-sm text-muted">
        New to EXEPRA?{" "}
        <Link href={`/account/register${params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : ""}`} className="font-medium text-ink underline underline-offset-2">Create an account</Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [accept, setAccept] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm({ ...form, [k]: v });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required.";
    if (!form.lastName.trim()) errs.lastName = "Last name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Please enter a valid email address.";
    const pw = passwordSchema.safeParse(form.password);
    if (!pw.success) errs.password = pw.error.issues[0].message;
    if (!accept) errs.accept = "Please accept the terms to continue.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setPending(true);
    const { error } = await authClient.signUp.email({
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      email: form.email.trim().toLowerCase(),
      password: form.password,
      callbackURL: "/account",
    });
    setPending(false);
    if (error) {
      return setErrors({
        form: error.status === 422 || error.message?.toLowerCase().includes("exist") ? "An account with this email already exists. Try signing in instead." : error.status === 429 ? "Too many attempts. Please try again later." : (error.message ?? "Could not create your account."),
      });
    }
    router.push(safeNext(params.get("next")));
    router.refresh();
  };

  const field = (k: keyof typeof form, label: string, type: string, ac: string, className = "") => (
    <div className={className}>
      <label htmlFor={k} className="label">{label}</label>
      {k === "password" ? (
        <PasswordInput id={k} name={k} autoComplete={ac} value={form[k]} onChange={set(k)} invalid={Boolean(errors[k])} />
      ) : (
        <input id={k} type={type} autoComplete={ac} value={form[k]} onChange={(e) => set(k)(e.target.value)} required className="field" aria-invalid={Boolean(errors[k]) || undefined} />
      )}
      {errors[k] && <p className="field-error">{errors[k]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-4" noValidate>
      {field("firstName", "First name", "text", "given-name", "col-span-2 sm:col-span-1")}
      {field("lastName", "Last name", "text", "family-name", "col-span-2 sm:col-span-1")}
      {field("email", "Email", "email", "email", "col-span-2")}
      <div className="col-span-2">
        {field("password", "Password", "password", "new-password")}
        <p className="mt-1.5 text-xs text-muted">At least 10 characters, including a letter and a number.</p>
      </div>
      <label className="col-span-2 flex items-start gap-3 text-sm text-ink-soft">
        <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#1f1d1b]" />
        <span>
          I accept the <Link href="/agb" className="underline underline-offset-2">terms and conditions</Link> and have read the <Link href="/datenschutz" className="underline underline-offset-2">privacy policy</Link>.
        </span>
      </label>
      {errors.accept && <p className="field-error col-span-2 -mt-2">{errors.accept}</p>}
      {errors.form && <p className="col-span-2 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">{errors.form}</p>}
      <Button type="submit" size="lg" className="col-span-2 h-12" loading={pending}>Create account</Button>
      <p className="col-span-2 text-center text-sm text-muted">
        Already have an account? <Link href="/account/login" className="font-medium text-ink underline underline-offset-2">Sign in</Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sent" | "error">("idle");
  const [pending, setPending] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    const { error } = await authClient.requestPasswordReset({ email: email.trim().toLowerCase(), redirectTo: "/account/reset-password" });
    setPending(false);
    setState(error && error.status === 429 ? "error" : "sent");
  };
  if (state === "sent") {
    return <p className="rounded-xl bg-white p-5 text-sm leading-relaxed" role="status">If an account exists for <strong>{email}</strong>, you&apos;ll receive an email with a link to reset your password. The link is valid for one hour.</p>;
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="field" />
      </div>
      {state === "error" && <p className="text-sm text-danger" role="alert">Too many requests. Please try again in a few minutes.</p>}
      <Button type="submit" size="lg" className="h-12 w-full" loading={pending}>Send reset link</Button>
      <p className="text-center text-sm"><Link href="/account/login" className="text-muted hover:text-ink">Back to sign in</Link></p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  if (!token) return <p className="text-sm text-danger">This reset link is invalid or has expired. <Link href="/account/forgot-password" className="underline">Request a new one</Link>.</p>;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pw = passwordSchema.safeParse(password);
    if (!pw.success) return setError(pw.error.issues[0].message);
    setPending(true);
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    setPending(false);
    if (error) return setError("This reset link is invalid or has expired. Please request a new one.");
    router.push("/account/login?reset=1");
  };
  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="password" className="label">New password</label>
        <PasswordInput id="password" name="password" autoComplete="new-password" value={password} onChange={setPassword} invalid={Boolean(error)} />
        <p className="mt-1.5 text-xs text-muted">At least 10 characters, including a letter and a number.</p>
      </div>
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      <Button type="submit" size="lg" className="h-12 w-full" loading={pending}>Set new password</Button>
    </form>
  );
}

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await authClient.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
