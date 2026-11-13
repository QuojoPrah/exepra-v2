import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Newsletter", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ConfirmNewsletter({ searchParams }: PageProps<"/newsletter/confirm">) {
  const { token } = await searchParams;
  const sub = typeof token === "string" ? await db.newsletterSubscriber.findUnique({ where: { token } }) : null;
  if (sub && sub.status === "PENDING") {
    await db.newsletterSubscriber.update({ where: { id: sub.id }, data: { status: "CONFIRMED", confirmedAt: new Date() } });
  }
  const ok = sub && sub.status !== "UNSUBSCRIBED";
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-3xl font-semibold">{ok ? "You're subscribed" : "Link invalid or expired"}</h1>
      <p className="mt-3 max-w-md text-muted">{ok ? "Thank you for confirming. Look out for new arrivals and offers in your inbox." : "Please subscribe again using the form in the footer."}</p>
      {ok && <p className="mt-2 text-xs text-muted">You can unsubscribe at any time via the link in every newsletter.</p>}
      <LinkButton href="/shop" className="mt-8">Explore the shop</LinkButton>
    </div>
  );
}
