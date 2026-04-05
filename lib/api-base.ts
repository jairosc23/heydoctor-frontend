/**
 * Origen del backend (sin `/api` final).
 * - Producción típica: `https://heydoctor-backend-pro-production.up.railway.app`
 * - Añade `https://` si falta el esquema (evita fetch relativo → 404 en Next).
 * - Quita un sufijo `/api` si ya venía en la variable (evita `/api/api/...`).
 */
export function getBackendOrigin(): string {
  let s = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")
    .trim()
    .replace(/\/+$/, "");
  if (!s) s = "http://localhost:3001";
  if (!/^https?:\/\//i.test(s)) {
    s = `https://${s}`;
  }
  if (/\/api$/i.test(s)) {
    s = s.replace(/\/api$/i, "");
  }
  return s.replace(/\/+$/, "");
}

/**
 * Base con prefijo `/api` (Nest). Se recalcula en cada llamada para usar siempre
 * la `NEXT_PUBLIC_API_URL` vigente (evita base congelada en el primer import del módulo).
 */
export function getApiBase(): string {
  return `${getBackendOrigin()}/api`;
}

/** URL absoluta POST /api/auth/login (body JSON: email, password). */
export function getAuthLoginUrl(): string {
  return `${getApiBase()}/auth/login`;
}

/** URL absoluta GET /api/auth/me (Jwt: Authorization Bearer obligatorio). */
export function getAuthMeUrl(): string {
  return `${getBackendOrigin()}/api/auth/me`;
}
