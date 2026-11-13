import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const getSession = cache(async () => {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch {
    return null;
  }
});

export async function requireUser(returnTo = "/account") {
  const session = await getSession();
  if (!session) redirect(`/account/login?next=${encodeURIComponent(returnTo)}`);
  return session;
}

export function isAdmin(session: Awaited<ReturnType<typeof getSession>>) {
  return session?.user && (session.user as { role?: string | null }).role === "admin";
}

/** For pages: redirects non-admins. */
export async function requireAdminPage() {
  const session = await getSession();
  if (!session) redirect("/account/login?next=/admin");
  if (!isAdmin(session)) redirect("/");
  return session;
}

export class AuthorizationError extends Error {}

/** For server actions / route handlers: throws for non-admins. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session || !isAdmin(session)) throw new AuthorizationError("Not authorized");
  return session;
}
