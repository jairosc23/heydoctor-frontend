import { envTruthy } from "./env-truthy";

const DEFAULT_BACKEND_DEV = "http://localhost:3001";

/** Flag de borde same-origin. Default OFF. No activar en producción en Bloque 1. */
export const HD_API_EDGE_FLAG = "NEXT_PUBLIC_HD_API_EDGE" as const;

/**
 * Origen del backend Nest (sin `/api` final). Única variable soportada:
 * `NEXT_PUBLIC_HEYDOCTOR_API_URL` (inyectada en build por Next/Vercel).
 *
 * - Desarrollo: si falta, `http://localhost:3001`.
 * - Producción: obligatoria; sin ella falla de forma explícita (no hay fallback a otro host).
 */
function normalizeBackendOrigin(raw: string): string {
  let s = raw.replace(/\/+$/, "");
  if (!s) {
    throw new Error("NEXT_PUBLIC_HEYDOCTOR_API_URL no puede estar vacía.");
  }
  if (!/^https?:\/\//i.test(s)) {
    s = `https://${s}`;
  }
  if (/\/api$/i.test(s)) {
    s = s.replace(/\/api$/i, "");
  }
  return s.replace(/\/+$/, "");
}

export function getBackendOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL?.trim();
  if (fromEnv) {
    return normalizeBackendOrigin(fromEnv);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Falta NEXT_PUBLIC_HEYDOCTOR_API_URL. Defínela en el build (p. ej. https://pro-api.heydoctor.health).",
    );
  }
  return normalizeBackendOrigin(DEFAULT_BACKEND_DEV);
}

export function isHdApiEdgeEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_HD_API_EDGE,
): boolean {
  return envTruthy(raw);
}

function nestApiBaseFromOrigin(): string {
  const origin = getBackendOrigin().replace(/\/+$/, "");
  return `${origin}/api`.replace(/([^:]\/)\/+/g, "$1");
}

/**
 * Base HTTP del browser.
 * Flag OFF (default): `{origin}/api` hacia Nest (comportamiento actual).
 * Flag ON: `/hd-api` same-origin (sin consumidores de producto en Bloque 1).
 */
export function getApiBase(): string {
  if (isHdApiEdgeEnabled()) {
    return "/hd-api";
  }
  return nestApiBaseFromOrigin();
}

/**
 * Base `/api` del Nest para Route Handlers y SSR. Nunca `/hd-api`.
 * Si `NEXT_PUBLIC_HEYDOCTOR_API_URL` apunta al mismo host que Next (error típico),
 * define `HEYDOCTOR_API_INTERNAL_URL` (p. ej. `http://localhost:3001`) para que
 * el proxy servidor llegue al Nest real.
 */
export function getServerNestApiBase(): string {
  const internal = process.env.HEYDOCTOR_API_INTERNAL_URL?.trim();
  if (!internal) {
    return nestApiBaseFromOrigin();
  }
  let s = internal.replace(/\/+$/, "");
  if (!s) return nestApiBaseFromOrigin();
  if (!/^https?:\/\//i.test(s)) {
    s = `https://${s}`;
  }
  if (/\/api$/i.test(s)) {
    return s.replace(/([^:]\/)\/+/g, "$1");
  }
  return `${s}/api`.replace(/([^:]\/)\/+/g, "$1");
}

/** URL absoluta GET /api/auth/me. */
export function getAuthMeUrl(): string {
  return `${getApiBase()}/auth/me`;
}

/** URL absoluta POST /api/auth/login. */
export function getAuthLoginUrl(): string {
  return `${getApiBase()}/auth/login`;
}

/** GET /api/auth/csrf — token para cabecera X-CSRF-Token en mutaciones cross-origin. */
export function getAuthCsrfUrl(): string {
  return `${getApiBase()}/auth/csrf`;
}
