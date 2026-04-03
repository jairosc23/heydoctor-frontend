/**
 * Origen del backend (sin `/api` final).
 * - Añade `https://` si falta el esquema (evita fetch relativo → 404 en Next).
 * - Quita un sufijo `/api` si ya venía en la variable.
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

/** Base con prefijo `/api` (Nest global prefix). */
export const API_URL = `${getBackendOrigin()}/api`;

export function getApiBase(): string {
  return API_URL;
}
