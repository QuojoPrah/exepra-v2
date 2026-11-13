import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Optimistic gate only: redirects visitors without a session cookie away from
 * protected areas. Authorisation (incl. the admin role) is always enforced on
 * the server in layouts, pages, server actions and route handlers.
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const url = new URL("/account/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account", "/account/orders/:path*", "/account/profile", "/account/addresses"],
};
