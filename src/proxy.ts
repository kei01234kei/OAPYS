import { NextRequest, NextResponse } from "next/server";
import { authenticated } from "@/lib/security-session";

// Send any visitor without a valid admin session to the sign-in page. This is a UX redirect only; the backend still enforces
// authorization on every API call.
export function proxy(request: NextRequest) {
  if (authenticated(request)) return NextResponse.next();
  const login = new URL("/login", request.url);
  const next = request.nextUrl.pathname + request.nextUrl.search;
  if (next !== "/") login.searchParams.set("next", next);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/((?!api/|login(?:/|$)|_next/static|_next/image|icon\\.svg|favicon\\.ico).*)",
  ],
};
