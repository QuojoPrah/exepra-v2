"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, FolderTree, Home, Layers, Mail, Menu, MessageSquareQuote, Package, Settings, Tag, Users, X, ExternalLink } from "lucide-react";
import { useState } from "react";
import ExepraLogo from "@/components/layout/ExepraLogo";
import { SignOutButton } from "@/components/account/auth-forms";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/collections", label: "Collections", icon: Layers },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  // Remember which page the menu was opened on, so navigating closes it automatically.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (v: boolean) => setOpenOn(v ? pathname : null);
  const panel = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <ExepraLogo href="/admin" className="text-2xl" />
        <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">Admin</span>
      </div>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {nav.map((n) => {
            const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
            return (
              <li key={n.href}>
                <Link href={n.href} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm", active ? "bg-ink text-white" : "text-ink-soft hover:bg-cream")}>
                  <n.icon className="h-4 w-4" aria-hidden /> {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-line p-4 text-sm">
        <Link href="/" target="_blank" className="mb-3 flex items-center gap-2 text-muted hover:text-ink"><ExternalLink className="h-4 w-4" /> View store</Link>
        <p className="truncate font-medium">{name}</p>
        <p className="truncate text-xs text-muted">{email}</p>
        <SignOutButton className="mt-2 text-xs text-muted underline-offset-2 hover:text-ink hover:underline" />
      </div>
    </div>
  );
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-line bg-white lg:block">{panel}</aside>
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <ExepraLogo href="/admin" className="text-xl" />
        <button type="button" onClick={() => setOpen(true)} aria-label="Open admin menu" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-cream"><Menu className="h-5 w-5" /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} aria-label="Close menu" />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full hover:bg-cream" aria-label="Close menu"><X className="h-5 w-5" /></button>
            {panel}
          </aside>
        </div>
      )}
    </>
  );
}
