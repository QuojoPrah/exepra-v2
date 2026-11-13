import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdminPage } from "@/lib/session";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · EXEPRA Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();
  return (
    <div className="flex min-h-dvh bg-[#f6f3ee]">
      <AdminSidebar name={session.user.name} email={session.user.email} />
      <main id="main" className="min-w-0 flex-1 px-4 pb-16 pt-20 sm:px-8 lg:pt-10">{children}</main>
    </div>
  );
}
