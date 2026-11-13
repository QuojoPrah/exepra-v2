import { NextResponse } from "next/server";
import { z } from "zod";
import { getWishlistIds, toggleWishlist } from "@/lib/wishlist";
import { isSameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ids: await getWishlistIds() }, { headers: { "Cache-Control": "no-store" } });
}

const schema = z.object({ productId: z.string().min(1).max(40), saved: z.boolean().optional() });

export async function POST(request: Request) {
  if (!(await isSameOrigin(request))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  try {
    return NextResponse.json({ ids: await toggleWishlist(parsed.data.productId, parsed.data.saved) });
  } catch {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
}
