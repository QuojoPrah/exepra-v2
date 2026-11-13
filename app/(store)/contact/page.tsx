import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Package, RotateCcw } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ContactForm } from "./contact-form";
import { getStoreSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Contact us", description: "Get in touch with the EXEPRA team.", alternates: { canonical: "/contact" } };

export default async function ContactPage() {
  const settings = await getStoreSettings();
  return (
    <div className="container-page py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div>
          <h1 className="text-4xl font-semibold">Contact us</h1>
          <p className="mt-3 max-w-md text-muted">Questions about an order, sizing or a product? We&apos;re happy to help.</p>
          <ul className="mt-10 space-y-6 text-sm">
            {settings.contactEmail && (
              <li className="flex gap-4"><Mail className="h-5 w-5 text-bronze-deep" aria-hidden /><span><span className="block font-medium">Email</span><a href={`mailto:${settings.contactEmail}`} className="text-muted underline-offset-2 hover:underline">{settings.contactEmail}</a></span></li>
            )}
            <li className="flex gap-4"><Package className="h-5 w-5 text-bronze-deep" aria-hidden /><span><span className="block font-medium">Where is my order?</span><Link href="/track-order" className="text-muted underline-offset-2 hover:underline">Track your order</Link></span></li>
            <li className="flex gap-4"><RotateCcw className="h-5 w-5 text-bronze-deep" aria-hidden /><span><span className="block font-medium">Returns</span><Link href="/rueckgabe" className="text-muted underline-offset-2 hover:underline">How returns work</Link></span></li>
          </ul>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
