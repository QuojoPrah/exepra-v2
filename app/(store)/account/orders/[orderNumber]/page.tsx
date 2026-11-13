import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { OrderDetail } from "@/components/account/order-detail";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

export default async function OrderPage({ params }: PageProps<"/account/orders/[orderNumber]">) {
  const { orderNumber } = await params;
  const session = await requireUser(`/account/orders/${orderNumber}`);
  // Scoped by userId: customers can never open another customer's order.
  const order = await db.order.findFirst({
    where: { orderNumber, userId: session.user.id },
    include: { items: true, history: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) notFound();
  return (
    <div>
      <Link href="/account/orders" className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> All orders
      </Link>
      <OrderDetail order={order} />
    </div>
  );
}
