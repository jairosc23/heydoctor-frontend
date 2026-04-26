/**
 * Token CSRF del Nest (double-submit): el navegador no puede leer la cookie `csrf_token`
 * del dominio del API desde `*.vercel.app`, así que el backend expone el valor en JSON
 * (login/register/refresh o GET /api/auth/csrf) y lo reenviamos en `X-CSRF-Token`.
 */

export const API_CSRF_HEADER = "x-csrf-token";

/** Cabecera típica de peticiones AJAX en mutaciones al API. */
export const API_X_REQUESTED_WITH = "x-requested-with";
export const API_XRW_XMLHTTPREQUEST = "XMLHttpRequest";

let _apiCsrfToken: string | null = null;

export function setApiCsrfToken(token: string | null): void {
  _apiCsrfToken = token?.trim() ? token.trim() : null;
}

export function getApiCsrfToken(): string | null {
  return _apiCsrfToken?.trim() ? _apiCsrfToken : null;
}

export function applyCsrfFromPayload(data: unknown): void {
  if (!data || typeof data !== "object") return;
  const t = (data as Record<string, unknown>).csrfToken;
  if (typeof t === "string" && t.trim().length >= 16) {
    setApiCsrfToken(t.trim());
  }
}
