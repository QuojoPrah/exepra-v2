import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export class StorageError extends Error {}

function cloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

/** Detect the real image type from magic bytes (never trust the client-provided MIME type). */
export function sniffImageType(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "image/webp";
  if (buf.subarray(4, 12).toString() === "ftypavif") return "image/avif";
  return null;
}

/**
 * Uploads an image. Production: Cloudinary (signed upload, no SDK needed).
 * Development fallback: writes to /public/uploads (not persistent on serverless hosts).
 */
export async function uploadImage(file: File, folder = "products"): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) throw new StorageError("Images must be 8 MB or smaller.");
  const buf = Buffer.from(await file.arrayBuffer());
  const type = sniffImageType(buf);
  if (!type || !ALLOWED_IMAGE_TYPES[type]) throw new StorageError("Only JPEG, PNG, WebP or AVIF images are allowed.");

  if (cloudinaryConfigured()) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const params = { folder: `exepra/${folder}`, timestamp };
    const toSign = Object.entries(params).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join("&");
    const signature = createHash("sha1").update(toSign + process.env.CLOUDINARY_API_SECRET).digest("hex");
    const form = new FormData();
    form.append("file", new Blob([buf], { type }), `upload.${ALLOWED_IMAGE_TYPES[type]}`);
    form.append("api_key", process.env.CLOUDINARY_API_KEY!);
    form.append("timestamp", timestamp);
    form.append("folder", params.folder);
    form.append("signature", signature);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: form });
    const data = (await res.json()) as { secure_url?: string; error?: { message: string } };
    if (!res.ok || !data.secure_url) throw new StorageError(data.error?.message ?? "Upload failed.");
    return data.secure_url;
  }

  if (process.env.NODE_ENV === "production") {
    throw new StorageError("Image storage is not configured. Set the CLOUDINARY_* environment variables.");
  }
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${ALLOWED_IMAGE_TYPES[type]}`;
  await writeFile(path.join(dir, name), buf);
  return `/uploads/${folder}/${name}`;
}
