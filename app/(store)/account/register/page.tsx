import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/components/account/auth-shell";
import { RegisterForm } from "@/components/account/auth-forms";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default async function RegisterPage() {
  if (await getSession()) redirect("/account");
  return (
    <AuthShell title="Create your account" subtitle="Track orders, save addresses and keep your wishlist on every device." image="/images/auth/sign-up-bg.jpg">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
