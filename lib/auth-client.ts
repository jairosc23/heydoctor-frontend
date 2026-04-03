/**
 * Auth client — access token en memoria; refresh HttpOnly en el dominio del API.
 * Cookie de primer partido `heydoctor_session` la gestiona /api/auth/session (ver lib/services/auth.ts).
 */

import { getApiBase } from "./api-base";

// ── In-memory access token ──────────────────────────────────────

let _accessToken: string | null = null;
let _refreshPromise: Promise<string | null> | null = null;
let _lastRefreshFailedAt = 0;

const REFRESH_COOLDOWN_MS = 3_000;

type RefreshStateListener = (isRefreshing: boolean) => void;
const refreshStateListeners = new Set<RefreshStateListener>();

/** Suscripción para overlay de “revalidando sesión” (AuthProvider). */
export function subscribeRefreshState(
  listener: RefreshStateListener
): () => void {
  refreshStateListeners.add(listener);
  return () => refreshStateListeners.delete(listener);
}

function emitRefreshState(isRefreshing: boolean): void {
  refreshStateListeners.forEach((l) => {
    try {
      l(isRefreshing);
    } catch {
      /* noop */
    }
  });
}

export function getAccessToken(): string | null {
  return _accessToken;
}

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

async function clearFirstPartySessionCookie(): Promise<void> {
  if (typeof window === "undefined") return;
  await fetch("/api/auth/session", {
    method: "DELETE",
    credentials: "include",
  }).catch(() => {});
}

// ── Refresh token flow ──────────────────────────────────────────

/**
 * Refreshes the access token via the HttpOnly refresh_token cookie (API origin).
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (Date.now() - _lastRefreshFailedAt < REFRESH_COOLDOWN_MS) {
    return null;
  }

  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = _doRefresh();
  try {
    return await _refreshPromise;
  } finally {
    _refreshPromise = null;
  }
}

async function _doRefresh(): Promise<string | null> {
  emitRefreshState(true);
  try {
    const res = await fetch(`${getApiBase()}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      _accessToken = null;
      _lastRefreshFailedAt = Date.now();
      await clearFirstPartySessionCookie();
      return null;
    }

    const data = (await res.json()) as { access_token?: string };
    _accessToken = data.access_token ?? null;

    if (_accessToken) {
      _lastRefreshFailedAt = 0;
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { Authorization: `Bearer ${_accessToken}` },
        credentials: "include",
      }).catch(() => {});
    }

    return _accessToken;
  } catch {
    _accessToken = null;
    _lastRefreshFailedAt = Date.now();
    return null;
  } finally {
    emitRefreshState(false);
  }
}

/**
 * Ensures an access token is available (refreshes if needed).
 */
export async function ensureAccessToken(): Promise<string | null> {
  if (_accessToken) return _accessToken;
  return refreshAccessToken();
}

// ── Login ───────────────────────────────────────────────────────

export interface AuthLoginResult {
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
}

export async function authLogin(
  email: string,
  password: string
): Promise<AuthLoginResult> {
  const loginUrl = `${getApiBase()}/auth/login`;
  if (process.env.NODE_ENV === "development") {
    console.log("LOGIN URL:", loginUrl);
  }

  const res = await fetch(loginUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  const text = await res.text();
  let data: Record<string, unknown>;
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    throw new Error(
      "El servidor no respondió correctamente. Verifica NEXT_PUBLIC_API_URL."
    );
  }

  if (!res.ok) {
    const raw =
      (data.message as string | string[] | undefined) ??
      (data.error as string | undefined);
    const msg = Array.isArray(raw) ? raw.join(", ") : raw;
    throw new Error(msg || "Error al iniciar sesión");
  }

  const token =
    (data.access_token as string | undefined) ??
    (data.jwt as string | undefined) ??
    (data.token as string | undefined) ??
    "";

  if (!token) {
    throw new Error("Respuesta de login sin access_token");
  }

  _accessToken = token;
  _lastRefreshFailedAt = 0;

  const u = (data.user ?? {}) as Record<string, unknown>;
  const fromNames = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  const fallback = fromNames || (u.email as string) || "";
  const name = (u.name as string) ?? fallback;

  return {
    user: {
      id: String(u.id ?? ""),
      email: (u.email as string) ?? "",
      name,
      role: u.role as string | undefined,
    },
  };
}

// ── Logout ──────────────────────────────────────────────────────

export async function authLogout(): Promise<void> {
  try {
    const headers: Record<string, string> = {};
    if (_accessToken) {
      headers["Authorization"] = `Bearer ${_accessToken}`;
    }
    await fetch(`${getApiBase()}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers,
    });
  } catch {
    // Always clear local state even if API call fails
  }

  _accessToken = null;
  _lastRefreshFailedAt = 0;
  await clearFirstPartySessionCookie();
}
