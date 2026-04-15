/**
 * Origen del backend (sin `/api` final). Única variable pública: `NEXT_PUBLIC_HEYDOCTOR_API_URL`.
 * Añade `https://` si falta el esquema; quita sufijo `/api` si ya venía en la variable.
 */
export function getBackendOrigin(): string {
  let s = (process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL ?? "http://localhost:3001")
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

/** Base con prefijo `/api` (Nest). */
export function getApiBase(): string {
  const origin = getBackendOrigin().replace(/\/+$/, "");
  return `${origin}/api`.replace(/([^:]\/)\/+/g, "$1");
}

/** URL absoluta GET /api/auth/me. */
export function getAuthMeUrl(): string {
  return `${getApiBase()}/auth/me`;
}

/** URL absoluta POST /api/auth/login. */
export function getAuthLoginUrl(): string {
  return `${getApiBase()}/auth/login`;
}
