/**
 * Auth client — login/register/refresh/logout al Nest con `credentials: 'include'`.
 * Cookies HttpOnly en el origen del API (`access_token`, `refresh_token`); sin JWT en localStorage.
 * Cookie de primer partido (`heydoctor_session`) si el backend devuelve JWT en JSON (legacy) o
 * con `COOKIE_DOMAIN` compartido; CSRF vía `csrfToken` en JSON + cabecera `X-CSRF-Token`
 * (necesario con front en Vercel y API en otro dominio).
 */

import { invalidateJwtPayloadCache } from "./auth-token";
import { emitAuthTelemetry } from "./auth-telemetry";
import { getApiBase, getAuthCsrfUrl, getAuthLoginUrl } from "./api-base";
import {
  applyCsrfFromPayload,
  getApiCsrfToken,
  setApiCsrfToken,
  API_CSRF_HEADER,
  API_X_REQUESTED_WITH,
  API_XRW_XMLHTTPREQUEST,
} from "./api-csrf";
// ── In-memory access token (opcional; p. ej. magic-link legacy). No localStorage. ──

let _accessToken: string | null = null;
let _refreshPromise: Promise<boolean> | null = null;
let _lastRefreshFailedAt = 0;

const REFRESH_COOLDOWN_MS = 3_000;
const AUTH_TAB_CHANNEL = "heydoctor-auth-v1";

type RefreshStateListener = (isRefreshing: boolean) => void;
const refreshStateListeners = new Set<RefreshStateListener>();

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
  return _accessToken?.trim() ? _accessToken : null;
}

export function setAccessToken(token: string | null): void {
  const next = token?.trim() ? token.trim() : null;
  if (_accessToken !== next) {
    invalidateJwtPayloadCache();
  }
  _accessToken = next;
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

function buildCsrfHeaders(): HeadersInit {
  const csrf = getApiCsrfToken();
  const headers: Record<string, string> = {
    [API_X_REQUESTED_WITH]: API_XRW_XMLHTTPREQUEST,
  };
  if (csrf) {
    headers[API_CSRF_HEADER] = csrf;
  }
  return headers;
}

/** Obtiene `csrfToken` del API (cookies existentes o nueva cookie). Llamar al montar la app. */
export async function bootstrapApiCsrf(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch(getAuthCsrfUrl(), {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return;
    const data = (await res.json()) as { csrfToken?: string };
    applyCsrfFromPayload(data);
    if (process.env.NODE_ENV === "development") {
      /* HttpOnly (p. ej. csrf en dominio del API) no aparece aquí; solo cookies legibles en Vercel. */
      console.log(
        "[auth-debug] document.cookie (origen actual):",
        document.cookie,
      );
    }
  } catch {
    /* noop */
  }
}

// ── Refresh (cookies HttpOnly; cuerpo puede incluir `csrfToken` y opcionalmente JWT) ──

/**
 * Rota access/refresh vía cookie `refresh_token`. Devuelve true si la respuesta fue OK
 * (nuevas cookies aplicadas por el navegador).
 */
export async function refreshAccessToken(): Promise<boolean> {
  if (Date.now() - _lastRefreshFailedAt < REFRESH_COOLDOWN_MS) {
    return false;
  }

  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = _doRefresh();
  try {
    return await _refreshPromise;
  } finally {
    _refreshPromise = null;
  }
}

async function _doRefresh(): Promise<boolean> {
  const accessTokenSnapshot = _accessToken;
  emitRefreshState(true);
  try {
    const res = await fetch(`${getApiBase()}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...buildCsrfHeaders(),
      },
    });

    if (!res.ok) {
      _lastRefreshFailedAt = Date.now();
      emitAuthTelemetry("refresh_fail", { status: res.status });
      if (_accessToken === accessTokenSnapshot) {
        setAccessToken(null);
      }
      await clearFirstPartySessionCookie();
      return false;
    }

    let data: { csrfToken?: string; ok?: boolean } = {};
    try {
      data = (await res.json()) as typeof data;
    } catch {
      data = {};
    }

    applyCsrfFromPayload(data);

    _lastRefreshFailedAt = 0;
    broadcastAuthMessage("token-refreshed");
    return true;
  } catch {
    _lastRefreshFailedAt = Date.now();
    emitAuthTelemetry("refresh_fail", { status: 0 });
    if (_accessToken === accessTokenSnapshot) {
      setAccessToken(null);
    }
    return false;
  } finally {
    emitRefreshState(false);
  }
}

/**
 * Garantiza sesión vía cookies del API (refresh sin cuerpo ni access_token).
 */
export async function ensureAccessToken(): Promise<boolean> {
  return refreshAccessToken();
}

export interface AuthLoginResult {
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
  const url = getAuthLoginUrl();

  if (process.env.NODE_ENV === "development") {
    console.log("[auth] POST login URL:", url);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const loginBody: { email: string; password: string } = {
    email: normalizedEmail,
    password,
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        [API_X_REQUESTED_WITH]: API_XRW_XMLHTTPREQUEST,
      },
      body: JSON.stringify(loginBody),
      credentials: "include",
    });
  } catch (cause) {
    emitAuthTelemetry("login_fail", { status: 0, network: true });
    const detail =
      cause instanceof Error ? cause.message : String(cause);
    throw new Error(
      `Error de red al contactar el API (POST /api/auth/login). ` +
        `Revisa CORS con credenciales en el backend, la política CSP connect-src del frontend y NEXT_PUBLIC_HEYDOCTOR_API_URL. ` +
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
        `Confirma que NEXT_PUBLIC_HEYDOCTOR_API_URL apunta al Nest y expone POST /api/auth/login.`,
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

  applyCsrfFromPayload(data);

  const u = (data.user ?? null) as Record<string, unknown> | null;
  if (!u || typeof u !== "object") {
    emitAuthTelemetry("login_fail", { status: res.status, reason: "no_user" });
    throw new Error("Respuesta de login inválida: falta user");
  }

  setAccessToken(null);

  const fromNames = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  const fallback = fromNames || (u.email as string) || "";
  const name = (u.name as string) ?? fallback;

  const userId = String(u.id ?? "");
  if (!userId) {
    emitAuthTelemetry("login_fail", { status: res.status, reason: "no_user_id" });
    throw new Error("Respuesta de login inválida: falta user");
  }

  _lastRefreshFailedAt = 0;
  emitAuthTelemetry("login_success", { userId });

  return {
    user: {
      id: userId,
      email: (u.email as string) ?? "",
      name,
      role: u.role as string | undefined,
    },
  };
}

export type AuthLogoutOptions = {
  skipRemote?: boolean;
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
        headers: {
          Accept: "application/json",
          ...buildCsrfHeaders(),
        },
      });
    }
  } catch {
    /* noop */
  }

  setAccessToken(null);
  setApiCsrfToken(null);
  _lastRefreshFailedAt = 0;
  await clearFirstPartySessionCookie();
}

attachMultiTabAuthSync();
