/**
 * Auth: login al Nest con `credentials: 'include'`; sesión en cookies HttpOnly del API.
 * `syncMiddlewareSession` opcional si hay JWT en memoria (legacy); con `COOKIE_DOMAIN` el edge valida `access_token`.
 */

import { getAuthMeUrl } from "../api-base";
import {
  authLogin as authLoginClient,
  authLogout as authLogoutClient,
  getAccessToken,
} from "../auth-client";
import { ApiError, heydoctorApi } from "../heydoctor-api";
import { setFirstPartySessionFromAccessToken } from "../first-party-session-cookie";

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
};

/**
 * Sincroniza cookie HttpOnly `heydoctor_session` en el **origen Next** (ruta relativa).
 * Nunca llames al dominio del API Nest: `/api/auth/session` solo existe en este frontend.
 */
export async function syncMiddlewareSession(accessToken: string): Promise<void> {
  await setFirstPartySessionFromAccessToken(accessToken);
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
  return { user: result.user };
}

export async function logout(): Promise<void> {
  await authLogoutClient();
  await clearMiddlewareSession();
}

/** Perfil: GET al Nest con cookies y `credentials: 'include'` (JWT en cookie o Bearer en memoria si existe). */
export async function getMe(): Promise<AuthUser> {
  const meUrl = getAuthMeUrl();

  try {
    return await heydoctorApi.get<AuthUser>(meUrl);
  } catch (err) {
    if (err instanceof ApiError) {
      const hint =
        err.status === 404
          ? ` Revisa NEXT_PUBLIC_HEYDOCTOR_API_URL y que el backend exponga GET /api/auth/me. URL usada: ${meUrl}.`
          : err.status === 401
            ? " Sesión no válida o cookies no enviadas (CORS / SameSite)."
            : "";
      throw new ApiError(`${err.message.trim()}${hint}`, err.status, err.body);
    }
    throw err;
  }
}

/** Sincroniza cookie Next si hay JWT en memoria (legacy). */
export async function primeSessionFromAccessToken(): Promise<void> {
  const t = getAccessToken()?.trim();
  if (!t) return;
  await syncMiddlewareSession(t);
}
