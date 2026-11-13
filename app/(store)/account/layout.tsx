import { AccountNav } from "@/components/account/account-nav";
import { getSession } from "@/lib/session";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  // Login/register/reset pages render without the account navigation.
  if (!session) return <>{children}</>;
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
        <AccountNav name={session.user.name} isAdmin={(session.user as { role?: string }).role === "admin"} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
