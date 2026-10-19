/**
 * Heurísticas de sesión para evitar refresh/overlay en visitantes anónimos.
 */

import { getAccessToken } from "./auth-access-memory";

/** Rutas públicas donde un visitante anónimo no necesita hidratación auth. */
export const PUBLIC_AUTH_ROUTES = new Set([
  "/",
  "/login",
  "/register",
  "/consultar",
  "/consulta-rapida",
  "/cookies",
  "/privacy",
  "/terms",
  "/telemedicine-consent",
  "/data-processing",
  "/for-doctors/apply",
]);

export function isPublicAuthRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  if (PUBLIC_AUTH_ROUTES.has(pathname)) return true;
  if (pathname.startsWith("/teleconsulta/invitado/")) return true;
  return false;
}

/** Indica si hay señales locales de sesión (JWT en RAM). Cookies HttpOnly no son legibles. */
export function hasLikelySession(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(getAccessToken()?.trim());
}

/**
 * Exact `/panel` only server-redirects to `/dashboard`. Refresh here is aborted
 * by that navigation while Nest still rotates the cookie; the next document
 * then replays the pre-rotation token (reuse → family revoke).
 */
export function isAuthRedirectStubPath(pathname: string | null): boolean {
  return pathname === "/panel";
}

/** En rutas públicas sin token en RAM, omitir refresh en mount. */
export function shouldSkipAuthBootstrapOnMount(pathname: string | null): boolean {
  return isPublicAuthRoute(pathname) && !hasLikelySession();
}
