import { NextRequest, NextResponse } from "next/server";
import {
  parseJwtPayload,
  type JwtPayloadClaims,
} from "@/lib/auth/jwt-utils";

const SESSION_COOKIE = "heydoctor_session";
/** Tolerancia de reloj (cliente vs Edge): no tratar como expirado si falta < skew. */
const SSR_SESSION_CLOCK_SKEW_MS = 5_000;

/**
 * Sesión SSR sin llamar al backend: estructura mínima del JWT (exp obligatorio) o cookie legacy.
 * No se verifica firma (fuente de verdad sigue siendo el API).
 */
function isSsrSessionValid(cookieValue: string | undefined): boolean {
  const token = cookieValue;

  if (token === "1") {
    return true;
  }

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

/** API producción HeyDoctor — fetch (REST) y WebSocket (Socket.IO); explícito además de wildcards. */
const HEYDOCTOR_PRO_API_ORIGIN = "https://pro-api.heydoctor.health";
const HEYDOCTOR_PRO_API_WS = "wss://pro-api.heydoctor.health";

/**
 * connect-src estricto pero completo: mismo origen, Railway legacy, subdominios *.heydoctor.health,
 * y host de API producción siempre presente (no depende solo de NEXT_PUBLIC_API_URL en build).
 */
function connectSrcDirective(): string {
  const parts = [
    "'self'",
    "https://*.railway.app",
    "wss://*.railway.app",
    "https://*.heydoctor.health",
    "wss://*.heydoctor.health",
    HEYDOCTOR_PRO_API_ORIGIN,
    HEYDOCTOR_PRO_API_WS,
  ];
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (raw) {
    try {
      const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      const u = new URL(normalized.replace(/\/api\/?$/i, ""));
      const origin = u.origin;
      const wss = u.protocol === "https:" ? `wss://${u.host}` : "";
      if (origin && !parts.includes(origin)) parts.push(origin);
      if (wss && !parts.includes(wss)) parts.push(wss);
    } catch {
      /* URL inválida en env: se ignoran entradas extra */
    }
  }
  return parts.join(" ");
}

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  `connect-src ${connectSrcDirective()}`,
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
