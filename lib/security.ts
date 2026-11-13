import "server-only";
import { headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";

export async function getClientIp(): Promise<string> {
  const h = await headers();
  // On Vercel, x-forwarded-for is set by the platform and the first entry is the client.
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/**
 * Fixed-window rate limiter backed by Postgres so it works across serverless instances.
 * Returns true when the request is allowed.
 */
export async function rateLimit(bucket: string, identifier: string, max: number, windowSeconds: number) {
  const key = `app:${bucket}:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  try {
    const existing = await db.rateLimit.findUnique({ where: { key } });
    if (!existing || Number(existing.lastRequest) < windowStart) {
      await db.rateLimit.upsert({
        where: { key },
        create: { id: randomUUID(), key, count: 1, lastRequest: BigInt(now) },
        update: { count: 1, lastRequest: BigInt(now) },
      });
      return true;
    }
    if (existing.count >= max) return false;
    await db.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
    return true;
  } catch (err) {
    console.error("[rate-limit]", err);
    return true; // fail open rather than locking customers out
  }
}

/**
 * CSRF defence for JSON route handlers that mutate state: the Origin header must
 * match this site. (Server Actions perform an equivalent check automatically.)
 */
export async function isSameOrigin(request: Request): Promise<boolean> {
  const origin = request.headers.get("origin");
  if (!origin) return request.method === "GET";
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
