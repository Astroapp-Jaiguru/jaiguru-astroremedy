import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Optimistic auth check (Next.js 16 "proxy", formerly middleware).
 * Full security checks happen in the admin layout / DAL - this only
 * pre-filters requests to /admin so unauthenticated users get redirected.
 *
 * Every /admin response also carries strict cache-busting headers so
 * Chrome (and any other browser) always fetches the freshest dashboard
 * JS/CSS/HTML instead of serving a stale cached copy.
 */
const NO_STORE_HEADERS: Record<string, string> = {
  "Cache-Control":
    "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  Vary: "*",
};

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
    const res = NextResponse.redirect(signinUrl);
    for (const [k, v] of Object.entries(NO_STORE_HEADERS)) res.headers.set(k, v);
    return res;
  }

  if (
    (pathname.startsWith("/admin/signin") ||
      pathname.startsWith("/admin/signup") ||
      pathname.startsWith("/admin/forgot-password") ||
      pathname.startsWith("/admin/reset-password")) &&
    hasSession
  ) {
    const res = NextResponse.redirect(new URL("/admin", request.url));
    for (const [k, v] of Object.entries(NO_STORE_HEADERS)) res.headers.set(k, v);
    return res;
  }

  const res = NextResponse.next();

  // Geo-pricing: stamp the viewer country on every page request so the
  // display layer can convert prices (Vercel provides x-vercel-ip-country;
  // cf-ipcountry applies when the site sits behind Cloudflare).
  const country =
    request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry");
  if (country) res.headers.set("x-viewer-country", country.toUpperCase().slice(0, 2));

  if (pathname.startsWith("/admin")) {
    for (const [k, v] of Object.entries(NO_STORE_HEADERS)) res.headers.set(k, v);
  }
  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|api/site-images|robots.txt|sitemap.xml).*)",
  ],
};