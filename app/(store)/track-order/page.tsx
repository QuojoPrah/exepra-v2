import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { OrderDetail } from "@/components/account/order-detail";
import { db } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/security";
import { trackOrderSchema } from "@/lib/validation";

export const metadata: Metadata = { title: "Track your order", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function TrackOrderPage({ searchParams }: PageProps<"/track-order">) {
  const sp = await searchParams;
  const orderParam = typeof sp.order === "string" ? sp.order : "";
  const emailParam = typeof sp.email === "string" ? sp.email : "";
  let error: string | null = null;
  let order = null;

  if (orderParam && emailParam) {
    const parsed = trackOrderSchema.safeParse({ orderNumber: orderParam, email: emailParam });
    if (!parsed.success) error = "Please enter a valid order number and email address.";
    else if (!(await rateLimit("track", await getClientIp(), 20, 600))) error = "Too many lookups. Please try again in a few minutes.";
    else {
      // Both order number AND email must match — prevents enumeration of other customers' orders.
      order = await db.order.findFirst({
        where: { orderNumber: parsed.data.orderNumber, email: parsed.data.email },
        include: { items: true, history: { orderBy: { createdAt: "asc" } } },
      });
      if (!order) error = "We couldn't find an order with these details. Please check your order number and email.";
    }
  }

  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "Track order" }]} />
      {order ? (
        <div className="mt-6"><OrderDetail order={order} /></div>
      ) : (
        <>
          <h1 className="mt-4 text-4xl font-semibold">Track your order</h1>
          <p className="mt-2 text-muted">Enter your order number (from your confirmation email) and the email address used at checkout.</p>
          <form method="get" className="mt-8 grid gap-4 rounded-[var(--radius-card)] border border-line bg-white p-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
            <div>
              <label htmlFor="order" className="label">Order number</label>
              <input id="order" name="order" defaultValue={orderParam} placeholder="EX261113-ABCDE" required className="field uppercase" />
            </div>
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" name="email" type="email" defaultValue={emailParam} required autoComplete="email" className="field" />
            </div>
            <Button type="submit" className="h-12">Find order</Button>
          </form>
          {error && <p className="mt-4 text-sm text-danger" role="alert">{error}</p>}
        </>
      )}
    </div>
  );
}
