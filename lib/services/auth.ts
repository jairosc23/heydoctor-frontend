/**
 * Auth: login al Nest con `credentials: 'include'`; cookies HttpOnly + CSRF en cabecera.
 * `syncMiddlewareSession` solo para flujos que aún obtienen JWT en cliente (p. ej. magic link).
 */

import {
  authLogin as authLoginClient,
  authLogout as authLogoutClient,
  getAccessToken,
  refreshAccessToken,
} from "../auth-client";
import { apiFetch as fetchWithIncludedCredentials } from "../api-fetch-include";
import { ApiError, apiFetch } from "../heydoctor-api";
import {
  FirstPartySessionError,
  setFirstPartySessionFromAccessToken,
} from "../first-party-session-cookie";

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

export async function syncMiddlewareSession(accessToken: string): Promise<void> {
  await setFirstPartySessionFromAccessToken(accessToken);
}

/**
 * El proxy SSR solo lee `heydoctor_session` (mismo origen). Tras login/refresh/getMe en el API,
 * sincroniza JWT en memoria → POST /api/auth/session antes de navegar a /panel.
 */
export async function ensureMiddlewareSessionForSsr(): Promise<void> {
  const started = Date.now();
  let token = getAccessToken()?.trim() ?? "";
  if (!token) {
    const refreshed = await refreshAccessToken({ silent: true });
    if (refreshed) {
      token = getAccessToken()?.trim() ?? "";
    }
  }
  if (!token) {
    throw new FirstPartySessionError(
      "No hay JWT para cookie heydoctor_session; el API puede tener sesión pero el Edge no.",
      0,
    );
  }
  await setFirstPartySessionFromAccessToken(token);
  const { recordSessionSyncCompleted } = await import("../session-analytics");
  recordSessionSyncCompleted(Date.now() - started, { outcome: "ok" });
}

export async function clearMiddlewareSession(): Promise<void> {
  if (typeof window === "undefined") return;
  await fetchWithIncludedCredentials("/api/auth/session", {
    method: "DELETE",
  }).catch(() => {});
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const result = await authLoginClient(email, password);
  return { user: result.user };
}

export async function logout(): Promise<void> {
  await authLogoutClient();
  await clearMiddlewareSession();
}

/** Perfil: GET al Nest solo con cookies (sin Authorization). */
export type GetMeOptions = {
  skipRefreshRetry?: boolean;
};

export async function getMe(options?: GetMeOptions): Promise<AuthUser> {
  try {
    return await apiFetch<AuthUser>(
      "/auth/me",
      {},
      { skipRefreshRetry: options?.skipRefreshRetry },
    );
  } catch (err) {
    if (err instanceof ApiError) {
      const hint =
        err.status === 404
          ? " Revisa NEXT_PUBLIC_HEYDOCTOR_API_URL y que el backend exponga GET /api/auth/me."
          : err.status === 401
            ? " Sesión no válida o cookies no enviadas (CORS / SameSite)."
            : "";
      throw new ApiError(`${err.message.trim()}${hint}`, err.status, err.body);
    }
    throw err;
  }
}

/** Sincroniza cookie Next para SSR (panel, rutas protegidas). */
export async function primeSessionFromAccessToken(): Promise<void> {
  await ensureMiddlewareSessionForSsr();
}
