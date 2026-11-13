import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/catalog";
import { getClientIp, rateLimit } from "@/lib/security";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.slice(0, 80) ?? "";
  if (q.trim().length < 2) return NextResponse.json({ products: [] });
  if (!(await rateLimit("search", await getClientIp(), 120, 60))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const products = await searchProducts(q, 6);
  return NextResponse.json({ products }, { headers: { "Cache-Control": "private, max-age=30" } });
}
