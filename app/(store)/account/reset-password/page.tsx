import type { Metadata } from "next";
import { AuthShell } from "@/components/account/auth-shell";
import { ResetPasswordForm } from "@/components/account/auth-forms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/account/reset-password">) {
  const { token, error } = await searchParams;
  return (
    <AuthShell title="Choose a new password">
      <ResetPasswordForm token={typeof token === "string" && !error ? token : null} />
    </AuthShell>
  );
}
