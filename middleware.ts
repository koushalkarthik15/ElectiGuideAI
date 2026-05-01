/**
 * ElectiGuide AI — Route Protection Middleware (Hardened)
 *
 * Intercepts requests to /(dashboard) routes and redirects
 * unauthenticated users to /login.
 *
 * Security hardening:
 * - Protects all sub-routes and nested paths
 * - Validates callbackUrl to prevent open redirect attacks
 * - Adds security headers to all responses
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = [
  "/registration",
  "/dossier",
  "/polling",
  "/results",
];

// Allowed callback URL origins (prevents open redirect)
const ALLOWED_CALLBACK_PREFIXES = [
  "/registration",
  "/dossier",
  "/polling",
  "/results",
  "/",
];

function isValidCallbackUrl(url: string): boolean {
  // Must be a relative path, not an absolute URL or protocol-relative
  if (url.startsWith("//") || url.includes("://")) return false;
  // Must start with one of our known prefixes
  return ALLOWED_CALLBACK_PREFIXES.some(
    (prefix) => url === prefix || url.startsWith(`${prefix}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Check for session cookie
  // Auth.js v5 uses "authjs.session-token" (dev) or "__Secure-authjs.session-token" (prod HTTPS)
  const sessionCookie =
    request.cookies.get("authjs.session-token") ??
    request.cookies.get("__Secure-authjs.session-token");

  if (!sessionCookie?.value) {
    const loginUrl = new URL("/login", request.url);

    // Only set callbackUrl if it passes validation
    if (isValidCallbackUrl(pathname)) {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }

    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return addSecurityHeaders(NextResponse.next());
}

/**
 * Inject baseline security headers on every response.
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return response;
}

export const config = {
  matcher: [
    "/registration/:path*",
    "/dossier/:path*",
    "/polling/:path*",
    "/results/:path*",
  ],
};
