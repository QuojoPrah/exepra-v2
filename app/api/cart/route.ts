import { NextResponse } from "next/server";
import { z } from "zod";
import { addToCart, applyCoupon, CartError, getCartView, setCartQuantity } from "@/lib/cart";
import { cartMutationSchema } from "@/lib/validation";
import { isSameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("add") }).extend(cartMutationSchema.shape),
  z.object({ action: z.literal("set") }).extend(cartMutationSchema.shape),
  z.object({ action: z.literal("coupon"), code: z.string().max(40).nullable() }),
]);

export async function GET() {
  return NextResponse.json(await getCartView(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await isSameOrigin(request))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const body = parsed.data;
  try {
    const cart =
      body.action === "add"
        ? await addToCart(body.variantId, Math.max(1, body.quantity))
        : body.action === "set"
          ? await setCartQuantity(body.variantId, body.quantity)
          : await applyCoupon(body.code);
    return NextResponse.json(cart);
  } catch (err) {
    if (err instanceof CartError) {
      return NextResponse.json({ error: err.message, cart: await getCartView() }, { status: 409 });
    }
    console.error("[cart]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
