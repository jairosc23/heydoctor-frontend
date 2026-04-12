/**
 * Cliente HTTP unificado al API Nest (HeyDoctor). Solo JWT (`Authorization: Bearer`);
 * no NextAuth, no GET /auth/csrf ni cabeceras X-CSRF-Token.
 *
 * Las rutas `/api/auth/session` del propio Next (cookie de middleware) siguen en * `first-party-session-cookie` / `auth-client` — no son el backend Railway.
 */

import {
  ApiError,
  apiDelete,
  apiFetch,
  apiGet,
  apiGetOrFallback,
  apiPatch,
  apiPost,
  apiPostOrFallback,
  fetchWithAuth,
  type ApiAuthOptions,
  type FetchWithAuthContext,
} from "./api-client";
import { getAccessToken } from "./auth-client";
import { HEYDOCTOR_ACCESS_TOKEN_STORAGE_KEY } from "./heydoctor-auth-constants";

export {
  getApiBase,
  getAuthLoginUrl,
  getAuthMeUrl,
  getBackendOrigin,
} from "./api-base";
export { fetchWithAuth, type FetchWithAuthContext, ApiError, type ApiAuthOptions };

export { HEYDOCTOR_ACCESS_TOKEN_STORAGE_KEY };

export function requireAccessToken(): string {
  const t = getAccessToken()?.trim();
  if (!t) {
    throw new Error("No auth token available");
  }
  return t;
}

export const heydoctorApi = {
  fetch: apiFetch,
  get: apiGet,
  post: apiPost,
  patch: apiPatch,
  delete: apiDelete,
  getOrFallback: apiGetOrFallback,
  postOrFallback: apiPostOrFallback,
} as const;
