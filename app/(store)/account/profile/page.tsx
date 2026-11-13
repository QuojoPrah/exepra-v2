import type { Metadata } from "next";
import { DeleteAccountForm, PasswordForm, ProfileForm } from "@/components/account/profile-forms";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Profile & security", robots: { index: false } };

export default async function ProfilePage() {
  const session = await requireUser("/account/profile");
  const [firstName, ...rest] = session.user.name.split(" ");
  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-3xl font-semibold">Profile &amp; security</h1>
        <div className="mt-8 rounded-[var(--radius-card)] border border-line bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">Personal details</h2>
          <ProfileForm firstName={firstName} lastName={rest.join(" ")} phone={(session.user as { phone?: string | null }).phone ?? ""} email={session.user.email} />
        </div>
      </section>
      <section className="rounded-[var(--radius-card)] border border-line bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold">Password</h2>
        <PasswordForm />
      </section>
      <section className="rounded-[var(--radius-card)] border border-line bg-white p-6">
        <h2 className="text-lg font-semibold">Your data</h2>
        <p className="mt-2 max-w-xl text-sm text-muted">Download a copy of the personal data we hold about you (profile, addresses, orders, reviews, wishlist) as a JSON file.</p>
        <a href="/api/account/export" className="mt-4 inline-flex h-11 items-center rounded-full border border-ink/15 bg-white px-6 text-sm font-medium hover:border-ink/40" download>
          Download my data
        </a>
      </section>
      <section className="rounded-[var(--radius-card)] border border-danger/30 bg-white p-6">
        <h2 className="text-lg font-semibold text-danger">Delete account</h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          This permanently deletes your account, saved addresses, wishlist and reviews. Order records are retained, without being linked to an account, for as long as German commercial and tax law requires (up to 10 years).
        </p>
        <div className="mt-5">
          <DeleteAccountForm />
        </div>
      </section>
    </div>
  );
}
