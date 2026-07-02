import { NextRequest, NextResponse } from "next/server";
import {
  parseJwtPayload,
  type JwtPayloadClaims,
} from "@/lib/auth/jwt-utils";
import { buildCspWithNonce } from "@/lib/csp-nonce";

const SESSION_COOKIE = "heydoctor_session";
/** Alineado con Nest (`ACCESS_TOKEN_COOKIE`). */
const ACCESS_TOKEN_COOKIE = "access_token";
/** Tolerancia de reloj (cliente vs Edge): no tratar como expirado si falta < skew. */
const SSR_SESSION_CLOCK_SKEW_MS = 5_000;

function isSsrSessionValid(cookieValue: string | undefined): boolean {
  const token = cookieValue;

  if (!token) {
    return false;
  }

  let payload: JwtPayloadClaims | null;
  try {
    payload = parseJwtPayload(token);
  } catch {
    return false;
  }

  if (payload == null || payload.exp == null || typeof payload.exp !== "number") {
    return false;
  }

  const now = Date.now();
  const expMs = payload.exp * 1000;
  if (expMs < now - SSR_SESSION_CLOCK_SKEW_MS) {
    return false;
  }

  return true;
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
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

const PUBLIC_EXACT_PATHS = new Set([
  "/",
  "/pricing",
  "/demo/interactive",
  "/consulta-rapida",
  "/consultar",
  "/for-doctors/apply",
  "/terms",
  "/privacy",
  "/cookies",
  "/data-processing",
  "/telemedicine-consent",
  "/robots.txt",
  "/sitemap.xml",
  "/opengraph-image",
  "/register",
]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/login")) return true;
  if (pathname.startsWith("/register")) return true;
  if (pathname.startsWith("/teleconsulta/invitado/")) return true;
  if (pathname.startsWith("/dr/")) return true;
  return false;
}

function requiresAuthentication(pathname: string): boolean {
  if (isPublicPath(pathname)) return false;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  return isProtected(pathname);
}

function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function applySecurityHeaders(response: NextResponse, csp: string): NextResponse {
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}

function buildCspForRequest(request: NextRequest, nonce: string): string {
  const isProd = process.env.NODE_ENV === "production";
  const reportUri = new URL("/api/csp-report", request.url).toString();
  return buildCspWithNonce({ nonce, isProd, reportUri });
}

function buildRequestHeaders(
  request: NextRequest,
  nonce: string,
  csp: string,
): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  return requestHeaders;
}

/**
 * Cookie de primer partido: el cliente POST `/api/auth/session` con Bearer tras login en el Nest.
 * Las cookies HttpOnly del API (`access_token` en pro-api.heydoctor.health) no llegan al Edge de Vercel.
 */
export function middleware(request: NextRequest) {
  if (process.env.DISABLE_ENTERPRISE_MIDDLEWARE === "1") {
    return NextResponse.next();
  }

  const nonce = createNonce();
  const csp = buildCspForRequest(request, nonce);
  const requestHeaders = buildRequestHeaders(request, nonce, csp);

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return applySecurityHeaders(NextResponse.next(), csp);
  }

  const sessionCookie =
    request.cookies.get(SESSION_COOKIE)?.value ??
    request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const hasSession = isSsrSessionValid(sessionCookie);

  if (requiresAuthentication(pathname) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl), csp);
  }

  if (pathname === "/login" && hasSession) {
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/panel", request.url)),
      csp,
    );
  }

  return applySecurityHeaders(
    NextResponse.next({ request: { headers: requestHeaders } }),
    csp,
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/csp-report|robots.txt|manifest.json|placeholder.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
