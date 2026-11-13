import "server-only";
import { db } from "@/lib/db";

/** True when the user has a paid order containing the product. */
export async function hasPurchased(userId: string, productId: string) {
  const count = await db.orderItem.count({
    where: { productId, order: { userId, paymentStatus: { in: ["PAID", "PARTIALLY_REFUNDED"] } } },
  });
  return count > 0;
}
