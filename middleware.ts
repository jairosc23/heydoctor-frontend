import { NextRequest, NextResponse } from "next/server";
import { parseJwtPayload } from "@/lib/auth/jwt-utils";

const SESSION_COOKIE = "heydoctor_session";

/**
 * Sesión SSR válida sin llamar al backend: presencia + exp del JWT en cookie.
 * Valor legacy `"1"`: se acepta mientras el navegador no haya expirado maxAge.
 * No se verifica firma aquí (fuente de verdad sigue siendo el API).
 */
function isSsrSessionValid(cookieValue: string | undefined): boolean {
  if (!cookieValue) {
    return false;
  }
  if (cookieValue === "1") {
    return true;
  }
  const payload = parseJwtPayload(cookieValue);
  if (!payload?.exp || typeof payload.exp !== "number") {
    return false;
  }
  return payload.exp * 1000 > Date.now();
}

const PROTECTED_PATHS = [
  "/dashboard",
  "/panel",
  "/consultas",
  "/patients",
  "/payment-success",
  "/teleconsulta",
  "/doctors",
  "/verify",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "connect-src 'self' https://*.railway.app wss://*.railway.app",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("Content-Security-Policy", CSP_DIRECTIVES);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Permissions-Policy",
    "camera=(self), microphone=(self), geolocation=()"
  );
  return response;
}

/**
 * Cookie de primer partido: POST /api/auth/session valida Bearer en Nest y fija JWT HttpOnly.
 * Aquí solo comprobamos exp localmente (sin fetch al backend).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return addSecurityHeaders(NextResponse.next());
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const hasSession = isSsrSessionValid(sessionCookie);

  if (isProtected(pathname) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if (pathname === "/login" && hasSession) {
    return addSecurityHeaders(
      NextResponse.redirect(new URL("/panel", request.url))
    );
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.json|placeholder.svg).*)",
  ],
};
