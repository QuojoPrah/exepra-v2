"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/account/auth-forms";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/profile", label: "Profile & security" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/wishlist", label: "Wishlist" },
];

export function AccountNav({ name, isAdmin }: { name: string; isAdmin: boolean }) {
  const pathname = usePathname();
  if (["/account/login", "/account/register", "/account/forgot-password", "/account/reset-password"].includes(pathname)) return null;
  return (
    <nav aria-label="Account" className="lg:sticky lg:top-28 lg:self-start">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">Signed in as</p>
      <p className="mt-1 font-display text-lg font-medium">{name}</p>
      <ul className="mt-6 flex gap-1 overflow-x-auto scrollbar-none lg:flex-col">
        {links.map((l) => {
          const active = l.href === "/account" ? pathname === "/account" : pathname.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link href={l.href} aria-current={active ? "page" : undefined} className={cn("block whitespace-nowrap rounded-full px-4 py-2 text-sm lg:rounded-xl", active ? "bg-ink text-white" : "hover:bg-cream")}>
                {l.label}
              </Link>
            </li>
          );
        })}
        {isAdmin && (
          <li>
            <Link href="/admin" className="block whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-bronze-deep hover:bg-cream lg:rounded-xl">
              Admin dashboard →
            </Link>
          </li>
        )}
        <li>
          <SignOutButton className="block w-full whitespace-nowrap rounded-full px-4 py-2 text-left text-sm text-muted hover:bg-cream hover:text-ink lg:rounded-xl" />
        </li>
      </ul>
    </nav>
  );
}
