/**
 * Auth: login al Nest con `credentials: 'include'`; access JWT en memoria + Bearer en peticiones autenticadas.
 * Cookie HttpOnly en el API: solo `refresh_token`. `syncMiddlewareSession` fija cookie en el origen Next para el middleware.
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
  accessToken: string;
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
  return { user: result.user, accessToken: result.accessToken };
}

export async function logout(): Promise<void> {
  await authLogoutClient();
  await clearMiddlewareSession();
}

/** Perfil: GET al Nest con Bearer (memoria) y `credentials: 'include'` (refresh). */
export async function getMe(_accessToken?: string): Promise<AuthUser> {
  const meUrl = getAuthMeUrl();

  try {
    return await heydoctorApi.get<AuthUser>(meUrl);
  } catch (err) {
    if (err instanceof ApiError) {
      const hint =
        err.status === 404
          ? ` Revisa NEXT_PUBLIC_HEYDOCTOR_API_URL / NEXT_PUBLIC_API_URL y que el backend exponga GET /api/auth/me. URL usada: ${meUrl}.`
          : err.status === 401
            ? " Sesión no válida o cookies no enviadas (CORS / SameSite)."
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
