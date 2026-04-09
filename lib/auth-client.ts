/**
 * Auth client — access token en memoria; refresh HttpOnly en el dominio del API.
 * Cookie de primer partido `heydoctor_session` la gestiona /api/auth/session (ver lib/services/auth.ts).
 */

import { invalidateJwtPayloadCache } from "./auth-token";
import { emitAuthTelemetry } from "./auth-telemetry";
import { getApiBase } from "./api-base";
import { setFirstPartySessionFromAccessToken } from "./first-party-session-cookie";

// ── In-memory access token ──────────────────────────────────────

let _accessToken: string | null = null;
let _refreshPromise: Promise<string | null> | null = null;
let _lastRefreshFailedAt = 0;

const REFRESH_COOLDOWN_MS = 3_000;
const AUTH_TAB_CHANNEL = "heydoctor-auth-v1";

type RefreshStateListener = (isRefreshing: boolean) => void;
const refreshStateListeners = new Set<RefreshStateListener>();

/** Suscripción para overlay de “revalidando sesión” (AuthProvider). */
export function subscribeRefreshState(
  listener: RefreshStateListener,
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
  if (_accessToken !== token) {
    invalidateJwtPayloadCache();
  }
  _accessToken = token;
}

function getTabId(): string {
  if (typeof sessionStorage === "undefined") return "no-ss";
  try {
    const k = "heydoctor_tab_id";
    let id = sessionStorage.getItem(k);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(k, id);
    }
    return id;
  } catch {
    return "unknown-tab";
  }
}

function broadcastAuthMessage(
  type: "logout" | "token-refreshed",
): void {
  if (typeof BroadcastChannel === "undefined") return;
  try {
    const ch = new BroadcastChannel(AUTH_TAB_CHANNEL);
    ch.postMessage({ type, from: getTabId() });
    ch.close();
  } catch {
    /* noop */
  }
}

let remoteRefreshCooldownUntil = 0;

function attachMultiTabAuthSync(): void {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return;
  }
  const ch = new BroadcastChannel(AUTH_TAB_CHANNEL);
  ch.onmessage = (ev: MessageEvent<{ type?: string; from?: string }>) => {
    const { type, from } = ev.data ?? {};
    if (!type || from === getTabId()) return;

    if (type === "logout") {
      void (async () => {
        await authLogout({ skipRemote: true, skipBroadcast: true });
        window.dispatchEvent(new CustomEvent("heydoctor:session-cleared"));
      })();
      return;
    }

    if (type === "token-refreshed") {
      const now = Date.now();
      if (now < remoteRefreshCooldownUntil) return;
      remoteRefreshCooldownUntil = now + 1_500;
      void refreshAccessToken();
    }
  };
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
  const accessTokenSnapshot = _accessToken;
  emitRefreshState(true);
  try {
    const res = await fetch(`${getApiBase()}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      _lastRefreshFailedAt = Date.now();
      emitAuthTelemetry("refresh_fail", { status: res.status });
      if (_accessToken === accessTokenSnapshot) {
        setAccessToken(null);
      }
      await clearFirstPartySessionCookie();
      return null;
    }

    const data = (await res.json()) as { access_token?: string };
    const next = (data.access_token ?? "").trim();
    setAccessToken(next || null);

    if (_accessToken) {
      _lastRefreshFailedAt = 0;
      await setFirstPartySessionFromAccessToken(_accessToken);
      broadcastAuthMessage("token-refreshed");
    }

    return _accessToken;
  } catch {
    _lastRefreshFailedAt = Date.now();
    emitAuthTelemetry("refresh_fail", { status: 0 });
    if (_accessToken === accessTokenSnapshot) {
      setAccessToken(null);
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
  password: string,
): Promise<AuthLoginResult> {
  const base = getApiBase();
  const url = `${base}/auth/login`;

  if (process.env.NODE_ENV === "development") {
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
  } catch (cause) {
    emitAuthTelemetry("login_fail", { status: 0, network: true });
    const detail =
      cause instanceof Error ? cause.message : String(cause);
    throw new Error(
      `Error de red al contactar el API (POST /api/auth/login). ` +
        `Revisa CORS con credenciales en el backend, la política CSP connect-src del frontend y NEXT_PUBLIC_API_URL. ` +
        `URL usada: ${url}. Detalle: ${detail}`,
    );
  }

  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    emitAuthTelemetry("login_fail", { status: res.status, parseError: true });
    throw new Error(
      `Respuesta no JSON (${res.status} ${res.statusText}). ` +
        `Confirma que NEXT_PUBLIC_API_URL apunta al Nest (p. ej. https://pro-api.heydoctor.health) y expone POST /api/auth/login.`,
    );
  }

  if (!res.ok) {
    emitAuthTelemetry("login_fail", { status: res.status });
    const msg = loginFailureMessage(res, data);
    if (res.status === 401) {
      throw new Error(`Credenciales incorrectas o sesión no válida. ${msg}`);
    }
    if (res.status >= 500) {
      throw new Error(`Error del servidor (${res.status}). ${msg}`);
    }
    throw new Error(msg);
  }

  const raw =
    (data.access_token as string | undefined) ??
    (data.jwt as string | undefined) ??
    (data.token as string | undefined) ??
    "";
  const token = typeof raw === "string" ? raw.trim() : "";

  if (!token) {
    emitAuthTelemetry("login_fail", { status: res.status, reason: "no_token" });
    throw new Error("Respuesta de login sin access_token");
  }

  setAccessToken(token);
  _lastRefreshFailedAt = 0;

  const u = (data.user ?? {}) as Record<string, unknown>;
  const fromNames = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  const fallback = fromNames || (u.email as string) || "";
  const name = (u.name as string) ?? fallback;

  const userId = String(u.id ?? "");
  emitAuthTelemetry("login_success", { userId });

  return {
    accessToken: token,
    user: {
      id: userId,
      email: (u.email as string) ?? "",
      name,
      role: u.role as string | undefined,
    },
  };
}

export type AuthLogoutOptions = {
  /** No llama POST /auth/logout (p. ej. otra pestaña ya revocó). */
  skipRemote?: boolean;
  /** No broadcast a otras pestañas (evita bucles). */
  skipBroadcast?: boolean;
};

export async function authLogout(options?: AuthLogoutOptions): Promise<void> {
  if (!options?.skipBroadcast) {
    broadcastAuthMessage("logout");
  }

  try {
    if (!options?.skipRemote) {
      await fetch(`${getApiBase()}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    }
  } catch {
    /* authLogout ya limpia estado local aunque falle el fetch */
  }

  setAccessToken(null);
  _lastRefreshFailedAt = 0;
  await clearFirstPartySessionCookie();
}

attachMultiTabAuthSync();
