/**
 * Lectura local del JWT (sin verificar firma). Para silent refresh y UX, no para confianza de seguridad.
 *
 * El margen (`leeway`) ante expiración solo se lee en el cliente; en SSR se usa el valor por defecto.
 */

import {
  parseJwtPayload,
  type JwtPayloadClaims,
} from "./auth/jwt-utils";

export type { JwtPayloadClaims };

let _parseJwtCacheToken: string | null = null;
let _parseJwtCachePayload: JwtPayloadClaims | null = null;

/** Invalidar cuando cambie el access token en memoria (login / refresh / logout). */
export function invalidateJwtPayloadCache(): void {
  _parseJwtCacheToken = null;
  _parseJwtCachePayload = null;
}

const DEFAULT_LEEWAY_SEC = 60;

function getLeewaySeconds(): number {
  if (typeof window === "undefined") {
    return DEFAULT_LEEWAY_SEC;
  }
  const value = Number(process.env.NEXT_PUBLIC_ACCESS_REFRESH_LEEWAY_SEC);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_LEEWAY_SEC;
}

function isJwtDebugEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return (
    process.env.NEXT_PUBLIC_JWT_DEBUG === "true" ||
    process.env.JWT_DEBUG === "true"
  );
}

export function parseJwt(token: string): JwtPayloadClaims | null {
  if (token === _parseJwtCacheToken && _parseJwtCachePayload) {
    return _parseJwtCachePayload;
  }
  const p = parseJwtPayload(token);
  _parseJwtCacheToken = token;
  _parseJwtCachePayload = p;
  return p;
}

/**
 * `true` si falta `exp` o queda menos de `leeway` segundos hasta expirar (refresh proactivo).
 * `leeway` = `NEXT_PUBLIC_ACCESS_REFRESH_LEEWAY_SEC` en cliente, o 60s por defecto.
 */
export function isTokenExpiringSoon(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload?.exp || typeof payload.exp !== "number") {
    return true;
  }
  const now = Date.now() / 1000;
  const leeway = getLeewaySeconds();

  if (isJwtDebugEnabled()) {
    console.debug("[JWT] exp check", {
      exp: payload.exp,
      now,
      leeway,
      remaining: payload.exp - now,
    });
  }

  return payload.exp - now < leeway;
}
