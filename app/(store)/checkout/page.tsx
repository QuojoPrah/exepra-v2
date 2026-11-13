import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { isStripeConfigured } from "@/lib/payments/stripe";
import { SUPPORTED_COUNTRIES } from "@/lib/validation";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  const sp = await searchParams;
  const session = await getSession();
  const addresses = session
    ? await db.address.findMany({ where: { userId: session.user.id }, orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }] })
    : [];
  const [firstName, ...rest] = (session?.user.name ?? "").split(" ");

  return (
    <CheckoutFlow
      cancelledOrder={typeof sp.cancelled === "string" ? sp.cancelled : null}
      paymentsEnabled={isStripeConfigured()}
      countries={SUPPORTED_COUNTRIES.map((c) => ({ code: c.code, name: c.name }))}
      customer={
        session
          ? { email: session.user.email, firstName, lastName: rest.join(" "), phone: (session.user as { phone?: string | null }).phone ?? "" }
          : null
      }
      savedAddresses={addresses.map((a) => ({
        id: a.id,
        firstName: a.firstName,
        lastName: a.lastName,
        company: a.company ?? "",
        street: a.street,
        houseNumber: a.houseNumber,
        addressLine2: a.addressLine2 ?? "",
        postalCode: a.postalCode,
        city: a.city,
        country: a.country,
        phone: a.phone ?? "",
      }))}
    />
  );
}
