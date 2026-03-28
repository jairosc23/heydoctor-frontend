/**
 * Auth client — production-grade session management.
 *
 * Access token: module-level variable (never persisted).
 * Refresh token: HttpOnly cookie managed by the backend (invisible to JS).
 * Session cookie: non-sensitive "active" flag for Next.js middleware routing.
 */

import { getApiBase } from "./api-base";

// ── In-memory access token ──────────────────────────────────────

let _accessToken: string | null = null;
let _refreshPromise: Promise<string | null> | null = null;
let _lastRefreshFailedAt = 0;

const REFRESH_COOLDOWN_MS = 3_000;

export function getAccessToken(): string | null {
  return _accessToken;
}

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

// ── Session cookie (non-sensitive marker for middleware) ─────────

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function setSessionCookie(): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? ";Secure" : "";
  document.cookie = `${SESSION_COOKIE}=active;path=/;max-age=${SESSION_MAX_AGE};SameSite=Lax${secure}`;
}

function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=;path=/;max-age=0`;
}

// ── Refresh token flow ──────────────────────────────────────────

/**
 * Refreshes the access token via the HttpOnly refresh_token cookie.
 * Uses a lock to prevent concurrent refresh calls (e.g. multiple 401s).
 * Enforces a cooldown to prevent rapid retry loops after failure.
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
  try {
    const res = await fetch(`${getApiBase()}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      _accessToken = null;
      _lastRefreshFailedAt = Date.now();
      clearSessionCookie();
      return null;
    }

    const data = (await res.json()) as { access_token?: string };
    _accessToken = data.access_token ?? null;

    if (_accessToken) {
      setSessionCookie();
      _lastRefreshFailedAt = 0;
    }

    return _accessToken;
  } catch {
    _accessToken = null;
    _lastRefreshFailedAt = Date.now();
    return null;
  }
}

/**
 * Ensures an access token is available (refreshes if needed).
 * Returns null if no valid session exists.
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
  const res = await fetch(`${getApiBase()}/auth/login`, {
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
    throw new Error(
      (data.message as string) ||
        (data.error as string) ||
        "Error al iniciar sesión"
    );
  }

  const token =
    (data.access_token as string) ??
    (data.jwt as string) ??
    (data.token as string) ??
    "";

  _accessToken = token;
  _lastRefreshFailedAt = 0;
  setSessionCookie();

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
  clearSessionCookie();

  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    localStorage.removeItem("logged");
    localStorage.removeItem("token");
  }
}
