import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Optimistic auth check (Next.js 16 "proxy", formerly middleware).
 * Full security checks happen in the admin layout / DAL - this only
 * pre-filters requests to /admin so unauthenticated users get redirected.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute =
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/signin") &&
    !pathname.startsWith("/admin/signup") &&
    !pathname.startsWith("/admin/forgot-password") &&
    !pathname.startsWith("/admin/reset-password");

  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (isAdminRoute && !hasSession) {
    const signinUrl = new URL("/admin/signin", request.url);
    signinUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signinUrl);
  }

  if (
    (pathname.startsWith("/admin/signin") ||
      pathname.startsWith("/admin/signup") ||
      pathname.startsWith("/admin/forgot-password") ||
      pathname.startsWith("/admin/reset-password")) &&
    hasSession
  ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
