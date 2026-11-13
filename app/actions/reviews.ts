"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { rateLimit } from "@/lib/security";
import { reviewSchema } from "@/lib/validation";
import { hasPurchased } from "@/lib/reviews";

export type ReviewState = { status: "idle" | "success" | "error"; message: string };

export async function submitReview(_: ReviewState, formData: FormData): Promise<ReviewState> {
  const session = await getSession();
  if (!session) return { status: "error", message: "Please sign in to write a review." };
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  if (!(await rateLimit("review", session.user.id, 5, 3600))) return { status: "error", message: "Too many reviews submitted. Please try later." };

  const { productId, rating, title, body, displayName } = parsed.data;
  if (!(await hasPurchased(session.user.id, productId))) {
    return { status: "error", message: "Only customers who have purchased this product can review it." };
  }
  const existing = await db.review.findUnique({ where: { productId_userId: { productId, userId: session.user.id } } });
  if (existing) return { status: "error", message: "You've already reviewed this product." };

  const product = await db.product.findUnique({ where: { id: productId }, select: { slug: true } });
  await db.review.create({
    data: { productId, userId: session.user.id, rating, title: title || null, body, displayName, isVerifiedPurchase: true, status: "PENDING" },
  });
  if (product) revalidatePath(`/product/${product.slug}`);
  return { status: "success", message: "Thank you! Your review will appear once it has been checked by our team." };
}
