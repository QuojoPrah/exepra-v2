import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function UnsubscribePage({ searchParams }: PageProps<"/newsletter/unsubscribe">) {
  const { token } = await searchParams;
  const sub = typeof token === "string" ? await db.newsletterSubscriber.findUnique({ where: { token } }) : null;
  if (sub && sub.status !== "UNSUBSCRIBED") {
    await db.newsletterSubscriber.update({ where: { id: sub.id }, data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() } });
  }
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-3xl font-semibold">{sub ? "You've been unsubscribed" : "Link invalid"}</h1>
      <p className="mt-3 max-w-md text-muted">{sub ? "You won't receive any more newsletters from us." : "This unsubscribe link is not valid."}</p>
      <LinkButton href="/" className="mt-8">Back to home</LinkButton>
    </div>
  );
}
