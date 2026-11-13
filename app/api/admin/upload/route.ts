import { NextResponse } from "next/server";
import { AuthorizationError, requireAdmin } from "@/lib/session";
import { isSameOrigin } from "@/lib/security";
import { StorageError, uploadImage } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthorizationError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    throw e;
  }
  if (!(await isSameOrigin(request))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const folder = String(form?.get("folder") ?? "products").replace(/[^a-z-]/g, "") || "products";
  if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  try {
    return NextResponse.json({ url: await uploadImage(file, folder) });
  } catch (e) {
    if (e instanceof StorageError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("[upload]", e);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
