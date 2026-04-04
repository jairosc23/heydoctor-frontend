/**
 * Auth client — access token en memoria; refresh HttpOnly en el dominio del API.
 * Cookie de primer partido `heydoctor_session` la gestiona /api/auth/session (ver lib/services/auth.ts).
 */

import { getApiBase, getBackendOrigin } from "./api-base";

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
  /** Captura para no pisar un token escritos por login concurrente al fallar refresh. */
  const accessTokenSnapshot = _accessToken;
  emitRefreshState(true);
  try {
    const res = await fetch(`${getApiBase()}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      _lastRefreshFailedAt = Date.now();
      if (_accessToken === accessTokenSnapshot) {
        _accessToken = null;
      }
      await clearFirstPartySessionCookie();
      return null;
    }

    const data = (await res.json()) as { access_token?: string };
    const next = (data.access_token ?? "").trim();
    _accessToken = next || null;

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
    _lastRefreshFailedAt = Date.now();
    if (_accessToken === accessTokenSnapshot) {
      _accessToken = null;
    }
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
  /** Mismo valor guardado en memoria (`_accessToken`); devolver explícito para el primer `getMe` tras login. */
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
}

function normalizeBackendMessage(field: unknown): string | undefined {
  if (field == null) return undefined;
  if (Array.isArray(field)) {
    return field.map((x) => String(x)).filter(Boolean).join(", ");
  }
  if (typeof field === "string") return field;
  return String(field);
}

/** Mensaje útil a partir del cuerpo JSON Nest u otros (login). */
function loginFailureMessage(
  res: Response,
  data: Record<string, unknown>,
): string {
  const fromBody =
    normalizeBackendMessage(data.message) ??
    normalizeBackendMessage(data.error);
  if (fromBody) {
    return `${fromBody} [HTTP ${res.status}]`;
  }
  return `HTTP ${res.status} ${res.statusText || "Error"}`.trim();
}

export async function authLogin(
  email: string,
  password: string
): Promise<AuthLoginResult> {
  const url = `${getBackendOrigin()}/api/auth/login`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    throw new Error(
      `La respuesta no era JSON (${res.status} ${res.statusText}). ` +
        "Comprueba NEXT_PUBLIC_API_URL (ej. https://heydoctor-backend-pro-production.up.railway.app) " +
        "y que el login use POST /api/auth/login contra el API Nest.",
    );
  }

  if (!res.ok) {
    throw new Error(loginFailureMessage(res, data));
  }

  const raw =
    (data.access_token as string | undefined) ??
    (data.jwt as string | undefined) ??
    (data.token as string | undefined) ??
    "";
  const token = typeof raw === "string" ? raw.trim() : "";

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
    accessToken: token,
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
