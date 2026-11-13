import type { Metadata } from "next";
import { AddressBook } from "@/components/account/address-book";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { SUPPORTED_COUNTRIES } from "@/lib/validation";

export const metadata: Metadata = { title: "Addresses", robots: { index: false } };

export default async function AddressesPage() {
  const session = await requireUser("/account/addresses");
  const addresses = await db.address.findMany({ where: { userId: session.user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] });
  return (
    <div>
      <h1 className="text-3xl font-semibold">Addresses</h1>
      <p className="mt-2 text-muted">Saved addresses are available for quick selection at checkout.</p>
      <AddressBook addresses={addresses} countries={SUPPORTED_COUNTRIES.map((c) => ({ code: c.code, name: c.name }))} />
    </div>
  );
}
