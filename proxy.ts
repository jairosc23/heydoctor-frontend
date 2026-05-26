import { NextRequest, NextResponse } from "next/server";
import {
  parseJwtPayload,
  type JwtPayloadClaims,
} from "@/lib/auth/jwt-utils";

const SESSION_COOKIE = "heydoctor_session";
/** Alineado con Nest (`ACCESS_TOKEN_COOKIE`). */
const ACCESS_TOKEN_COOKIE = "access_token";
/** Tolerancia de reloj (cliente vs Edge): no tratar como expirado si falta < skew. */
const SSR_SESSION_CLOCK_SKEW_MS = 5_000;

/**
 * Sesión SSR sin llamar al backend: estructura mínima del JWT (exp obligatorio) o cookie legacy.
 * No se verifica firma (fuente de verdad sigue siendo el API).
 */
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
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  /** CSP: solo en next.config.mjs (una sola política; duplicar aquí provoca intersección y pantalla en blanco). */
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
 * Cookie de primer partido: el cliente POST `/api/auth/session` con Bearer tras login en el Nest.
 * Las cookies HttpOnly del API (`access_token` en pro-api.heydoctor.health) no llegan al Edge de Vercel.
 * El handler solo valida forma/exp del JWT; aquí comprobamos `exp` localmente (sin fetch al backend).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return addSecurityHeaders(NextResponse.next());
  }

  const sessionCookie =
    request.cookies.get(SESSION_COOKIE)?.value ??
    request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
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
