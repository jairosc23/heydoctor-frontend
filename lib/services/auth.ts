/**
 * Auth contra el backend Nest (JWT + refresh HttpOnly en el dominio API).
 * El access_token permanece solo en memoria (vía auth-client).
 */

import { getAuthMeUrl } from "../api-base";
import {
  authLogin as authLoginClient,
  authLogout as authLogoutClient,
  getAccessToken,
  refreshAccessToken,
} from "../auth-client";
import { ApiError, apiGet } from "../api-client";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  clinicId: string;
  plan: "free" | "pro";
};

export type LoginResultUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
};

/** Sincroniza cookie HttpOnly de primer partido (middleware) tras validar Bearer en el backend. */
export async function syncMiddlewareSession(): Promise<void> {
  if (typeof window === "undefined") return;
  const token = getAccessToken();
  if (!token) return;
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  }).catch(() => {});
}

export async function clearMiddlewareSession(): Promise<void> {
  if (typeof window === "undefined") return;
  await fetch("/api/auth/session", {
    method: "DELETE",
    credentials: "include",
  }).catch(() => {});
}

export async function login(
  email: string,
  password: string
): Promise<{ user: LoginResultUser }> {
  const result = await authLoginClient(email, password);
  await syncMiddlewareSession();
  return result;
}

export async function logout(): Promise<void> {
  await authLogoutClient();
  await clearMiddlewareSession();
}

export async function getMe(): Promise<AuthUser> {
  if (!getAccessToken()) {
    await refreshAccessToken();
  }
  if (!getAccessToken()) {
    throw new Error(
      "No hay access_token para /auth/me: inicia sesión o revisa la cookie refresh en el dominio del API.",
    );
  }

  const meUrl = getAuthMeUrl();

  try {
    // URL absoluta + Bearer vía fetchWithAuth/apiFetch (no depende solo de cookies).
    return await apiGet<AuthUser>(meUrl);
  } catch (err) {
    if (err instanceof ApiError) {
      const hint =
        err.status === 404
          ? ` Revisa NEXT_PUBLIC_API_URL y que el backend exponga GET /api/auth/me. URL usada: ${meUrl} (header Authorization Bearer obligatorio).`
          : err.status === 401
            ? " El token puede ser inválido o estar ausente en la petición."
            : "";
      throw new ApiError(`${err.message.trim()}${hint}`, err.status, err.body);
    }
    throw err;
  }
}

/** Útil tras registro/login manual si ya hay token en memoria. */
export async function primeSessionFromAccessToken(): Promise<void> {
  await syncMiddlewareSession();
}
