import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/components/account/auth-shell";
import { LoginForm } from "@/components/account/auth-forms";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/account/login">) {
  const sp = await searchParams;
  if (await getSession()) redirect(typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/account");
  return (
    <AuthShell title="Welcome back" subtitle={sp.reset ? "Your password has been changed. Please sign in." : "Sign in to your EXEPRA account."}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
