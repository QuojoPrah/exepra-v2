import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/** GDPR Art. 15/20: export of the signed-in customer's personal data. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const [user, addresses, orders, reviews, wishlist, newsletter] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, phone: true, emailVerified: true, createdAt: true } }),
    db.address.findMany({ where: { userId }, omit: { userId: true } }),
    db.order.findMany({ where: { userId }, include: { items: true, history: { select: { status: true, createdAt: true } } }, omit: { cartId: true, stripeSessionId: true } }),
    db.review.findMany({ where: { userId }, select: { productId: true, rating: true, title: true, body: true, displayName: true, status: true, createdAt: true } }),
    db.wishlist.findUnique({ where: { userId }, select: { items: { select: { productId: true, createdAt: true } } } }),
    db.newsletterSubscriber.findUnique({ where: { email: session.user.email }, select: { status: true, consentText: true, consentAt: true, confirmedAt: true } }),
  ]);
  const body = JSON.stringify({ exportedAt: new Date().toISOString(), user, addresses, orders, reviews, wishlist: wishlist?.items ?? [], newsletter }, null, 2);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="exepra-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
