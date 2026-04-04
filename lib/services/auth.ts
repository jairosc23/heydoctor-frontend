/**
 * Auth contra el backend Nest (JWT + refresh HttpOnly en el dominio API).
 * El access_token permanece solo en memoria (vía auth-client).
 */

import { getAuthMeUrl } from "../api-base";
import {
  authLogin as authLoginClient,
  authLogout as authLogoutClient,
  getAccessToken,
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

export type LoginResult = {
  user: LoginResultUser;
  accessToken: string;
};

/**
 * Sincroniza cookie HttpOnly `heydoctor_session` en el **origen Next** (ruta relativa).
 * Nunca llames al dominio del API Nest: `/api/auth/session` solo existe en este frontend.
 */
export async function syncMiddlewareSession(accessToken: string): Promise<void> {
  if (typeof window === "undefined") return;
  const token = accessToken.trim();
  if (!token) return;

  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });

  if (!res.ok && process.env.NODE_ENV === "development") {
    console.warn(
      "[syncMiddlewareSession] POST /api/auth/session",
      res.status,
    );
  }
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
): Promise<LoginResult> {
  const result = await authLoginClient(email, password);
  return { user: result.user, accessToken: result.accessToken };
}

export async function logout(): Promise<void> {
  await authLogoutClient();
  await clearMiddlewareSession();
}

/** @param accessToken Token explícito (p. ej. recién devuelto por login); si omites, se usa memoria/refresh. */
export async function getMe(accessToken?: string): Promise<AuthUser> {
  const meUrl = getAuthMeUrl();
  const auth = accessToken?.trim()
    ? { bearerToken: accessToken.trim() }
    : undefined;

  try {
    return await apiGet<AuthUser>(meUrl, auth);
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

/** Útil si ya hay token en memoria (mismo flujo que login, sin segundo argumento opcional). */
export async function primeSessionFromAccessToken(): Promise<void> {
  const t = getAccessToken()?.trim();
  if (!t) return;
  await syncMiddlewareSession(t);
}
