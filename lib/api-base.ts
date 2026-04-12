/**
 * Origen del backend (sin `/api` final).
 * - Producción: `NEXT_PUBLIC_HEYDOCTOR_API_URL` (p. ej. https://pro-api.heydoctor.health).
 * - Solo si falta: `NEXT_PUBLIC_API_URL` (compat. legado).
 * - Añade `https://` si falta el esquema (evita fetch relativo → 404 en Next).
 * - Quita un sufijo `/api` si ya venía en la variable (evita `/api/api/...`).
 */
export function getBackendOrigin(): string {
  let s = (
    process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001"
  )
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
 * `NEXT_PUBLIC_HEYDOCTOR_API_URL` (o `NEXT_PUBLIC_API_URL` en legado).
 *
 * Resultado típico producción: `https://…railway.app/api` (un solo `/api`, sin slash final).
 */
export function getApiBase(): string {
  const origin = getBackendOrigin().replace(/\/+$/, "");
  return `${origin}/api`.replace(/([^:]\/)\/+/g, "$1");
}

/** URL absoluta GET /api/auth/me (JWT en cabecera `Authorization: Bearer` + cookie `refresh_token`). */
export function getAuthMeUrl(): string {
  return `${getApiBase()}/auth/me`;
}

/**
 * URL absoluta POST /api/auth/login (solo navegador → Nest; nunca vía Route Handler).
 * Con `NEXT_PUBLIC_HEYDOCTOR_API_URL=https://pro-api.heydoctor.health` → …/api/auth/login.
 */
export function getAuthLoginUrl(): string {
  return `${getApiBase()}/auth/login`;
}
