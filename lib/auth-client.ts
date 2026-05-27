/**
 * Auth client — login/register/refresh/logout al Nest con `credentials: 'include'`
 * vía `apiFetch` de `./api-fetch-include` (reexportado aquí).
 *
 * Híbrido: cookies HttpOnly primero; el backend también devuelve `access_token` en JSON y el
 * cliente lo guarda solo en RAM (`auth-access-memory`) y lo envía como `Authorization: Bearer`
 * si falta cookie (p.ej. navegadores que bloquean third-party cookies). Sin JWT en localStorage.
 * CSRF vía `csrfToken` en JSON + cabecera `X-CSRF-Token`.
 */

import { AUTH_REQUEST_TIMEOUT_MS } from "./async/auth-request-config";
import {
  fetchWithTimeout,
  FetchTimeoutError,
} from "./async/fetch-with-timeout";
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
import { apiFetch as fetchWithIncludedCredentials } from "./api-fetch-include";
import { getLogger } from "./logger";

import {
  getAccessToken,
  setAccessToken,
} from "./auth-access-memory";

export { getAccessToken, setAccessToken };
export { FetchTimeoutError };

/** Reexport: peticiones al API Nest desde el cliente con cookies cross-site (+ Bearer fallback). */
export { apiFetch } from "./api-fetch-include";

let _refreshPromise: Promise<boolean> | null = null;
let _refreshAbortController: AbortController | null = null;
/** Solo tras 401 en POST /auth/refresh (sesión realmente inválida). */
let _lastHardRefreshFailAt = 0;
/** Evita doble retry inmediato en heydoctor-api tras timeout de refresh. */
let _lastRefreshTimedOutAt = 0;

const REFRESH_COOLDOWN_MS = 3_000;
const REFRESH_TIMEOUT_COOLDOWN_MS = 3_000;
const AUTH_TAB_CHANNEL = "heydoctor-auth-v1";

const logAuth = getLogger("AUTH");
const logRefresh = getLogger("REFRESH");

export type RefreshAccessTokenOptions = {
  /** Si true, no monta overlay global (refresh en background). */
  silent?: boolean;
};

type RefreshStateListener = (isRefreshing: boolean) => void;
const refreshStateListeners = new Set<RefreshStateListener>();
/** Ref-count del overlay visible (solo refreshes no silenciosos). */
let _refreshOverlayDepth = 0;

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

function emitRefreshOverlayDelta(delta: number): void {
  _refreshOverlayDepth = Math.max(0, _refreshOverlayDepth + delta);
  emitRefreshState(_refreshOverlayDepth > 0);
}

/** Solo tests: profundidad actual del overlay visible. */
export function getRefreshOverlayDepthForTests(): number {
  return _refreshOverlayDepth;
}

/** Indica si el último refresh falló por timeout (se consume al leer). */
export function consumeLastRefreshTimedOut(): boolean {
  if (_lastRefreshTimedOutAt === 0) return false;
  const timedOut =
    Date.now() - _lastRefreshTimedOutAt < REFRESH_TIMEOUT_COOLDOWN_MS;
  _lastRefreshTimedOutAt = 0;
  return timedOut;
}

/** Fuerza cierre del ciclo overlay/refresh (runtime stabilizer / unmount). */
export function forceResetRefreshState(): void {
  _refreshAbortController?.abort();
  _refreshAbortController = null;
  _refreshOverlayDepth = 0;
  emitRefreshState(false);
}

/** Cancela peticiones auth en vuelo (refresh, CSRF bootstrap). */
export function cancelInFlightAuthRequests(): void {
  _refreshAbortController?.abort();
  _refreshAbortController = null;
  _bootstrapAbortController?.abort();
  _bootstrapAbortController = null;
  _bootstrapPromise = null;
  _refreshOverlayDepth = 0;
  emitRefreshState(false);
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
let _lastRefreshAbortedAt = 0;
const REFRESH_ABORT_COOLDOWN_MS = 2_000;

/** Consume si el último refresh falló por abort (evita reintentos en cadena ante 401). */
export function consumeLastRefreshAborted(): boolean {
  if (_lastRefreshAbortedAt === 0) return false;
  const aborted =
    Date.now() - _lastRefreshAbortedAt < REFRESH_ABORT_COOLDOWN_MS;
  _lastRefreshAbortedAt = 0;
  return aborted;
}

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
      void bootstrapApiCsrf();
      return;
    }
  };
}

async function clearFirstPartySessionCookie(): Promise<void> {
  if (typeof window === "undefined") return;
  await fetchWithIncludedCredentials("/api/auth/session", {
    method: "DELETE",
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

function authFetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  signal?: AbortSignal,
): Promise<Response> {
  return fetchWithTimeout(input, init, {
    timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
    signal,
    fetchImpl: fetchWithIncludedCredentials,
  });
}

let _bootstrapPromise: Promise<void> | null = null;
let _bootstrapAbortController: AbortController | null = null;

/**
 * Obtiene `csrfToken` del API (cookies existentes o nueva cookie). Llamar al montar la app.
 * In-flight deduplicada: múltiples llamadas concurrentes comparten el mismo fetch.
 */
export async function bootstrapApiCsrf(): Promise<void> {
  if (typeof window === "undefined") return;
  if (_bootstrapPromise) return _bootstrapPromise;

  _bootstrapAbortController?.abort();
  const abortController = new AbortController();
  _bootstrapAbortController = abortController;

  _bootstrapPromise = (async () => {
    try {
      const res = await authFetchWithTimeout(
        getAuthCsrfUrl(),
        {
          method: "GET",
          headers: { Accept: "application/json" },
        },
        abortController.signal,
      );
      if (!res.ok) return;
      const data = (await res.json()) as { csrfToken?: string };
      applyCsrfFromPayload(data);
      if (process.env.NODE_ENV === "development") {
        logAuth.debug("CSRF bootstrap completed", {
          csrfPresent: Boolean(getApiCsrfToken()),
        });
      }
    } catch (err) {
      if (err instanceof FetchTimeoutError) {
        emitAuthTelemetry("csrf_bootstrap_timeout", {
          durationMs: err.timeoutMs,
        });
        logAuth.warn("CSRF bootstrap timed out", { durationMs: err.timeoutMs });
      }
    } finally {
      if (_bootstrapAbortController === abortController) {
        _bootstrapAbortController = null;
      }
      _bootstrapPromise = null;
    }
  })();

  return _bootstrapPromise;
}

// ── Refresh (cookies HttpOnly; cuerpo puede incluir `csrfToken` y opcionalmente JWT) ──

function chainRefreshPromise(run: Promise<boolean>): Promise<boolean> {
  releaseRefreshPromiseDeferred(run);
  return run;
}

function releaseRefreshPromiseDeferred(run: Promise<boolean>): void {
  run.finally(() => {
    setTimeout(() => {
      if (_refreshPromise === run) {
        _refreshPromise = null;
      }
    }, 0);
  });
}

/**
 * Rota access/refresh vía cookie `refresh_token`. Devuelve true si la respuesta fue OK
 * (nuevas cookies aplicadas por el navegador).
 */
export async function refreshAccessToken(
  options: RefreshAccessTokenOptions = {},
): Promise<boolean> {
  if (Date.now() - _lastHardRefreshFailAt < REFRESH_COOLDOWN_MS) {
    return false;
  }

  if (_refreshPromise) return _refreshPromise;

  const run = _doRefresh(options);
  _refreshPromise = run;
  return chainRefreshPromise(run);
}

async function _doRefresh(
  options: RefreshAccessTokenOptions = {},
): Promise<boolean> {
  const silent = options.silent ?? false;
  const accessTokenSnapshot = getAccessToken();

  const abortController = new AbortController();
  const previousController = _refreshAbortController;
  _refreshAbortController = abortController;
  if (previousController && previousController !== abortController) {
    previousController.abort();
  }

  if (!silent) {
    emitRefreshOverlayDelta(+1);
  }
  try {
    const res = await authFetchWithTimeout(
      `${getApiBase()}/auth/refresh`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...buildCsrfHeaders(),
        },
      },
      abortController.signal,
    );

    if (!res.ok) {
      emitAuthTelemetry("refresh_fail", { status: res.status });
      logRefresh.warn("refresh failed", { status: res.status });
      if (res.status === 401) {
        _lastHardRefreshFailAt = Date.now();
        if (getAccessToken() === accessTokenSnapshot) {
          setAccessToken(null);
        }
        await clearFirstPartySessionCookie();
      }
      return false;
    }

    let data: { csrfToken?: string; ok?: boolean; access_token?: string } = {};
    try {
      data = (await res.json()) as typeof data;
    } catch {
      data = {};
    }

    applyCsrfFromPayload(data);

    const newAccess = data.access_token;
    if (typeof newAccess === "string" && newAccess.trim()) {
      setAccessToken(newAccess.trim());
    }

    _lastHardRefreshFailAt = 0;
    broadcastAuthMessage("token-refreshed");
    logRefresh.info("refresh ok");
    return true;
  } catch (e) {
    if (e instanceof FetchTimeoutError) {
      _lastRefreshTimedOutAt = Date.now();
      emitAuthTelemetry("refresh_timeout", { durationMs: e.timeoutMs });
      logRefresh.warn("refresh timed out", { durationMs: e.timeoutMs });
      return false;
    }
    if (
      e instanceof DOMException &&
      (e.name === "AbortError" || e.code === 20)
    ) {
      _lastRefreshAbortedAt = Date.now();
      return false;
    }
    emitAuthTelemetry("refresh_fail", { status: 0 });
    logRefresh.error("refresh threw (non-timeout)", {
      error: e instanceof Error ? e.message : String(e),
    });
    throw e;
  } finally {
    if (_refreshAbortController === abortController) {
      _refreshAbortController = null;
    }
    if (!silent) {
      emitRefreshOverlayDelta(-1);
    }
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

  setAccessToken(null);
  await bootstrapApiCsrf();

  const normalizedEmail = email.trim().toLowerCase();
  const loginBody: { email: string; password: string } = {
    email: normalizedEmail,
    password,
  };

  if (typeof window !== "undefined") {
    logAuth.debug("login start", { url });
  }

  let res: Response;
  try {
    res = await authFetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...buildCsrfHeaders(),
      },
      body: JSON.stringify(loginBody),
    });
  } catch (cause) {
    emitAuthTelemetry("login_fail", { status: 0, network: true });
    const detail =
      cause instanceof Error ? cause.message : String(cause);
    const isTimeout = cause instanceof FetchTimeoutError;
    throw new Error(
      isTimeout
        ? `Tiempo de espera agotado al contactar el API (POST /api/auth/login). URL: ${url}.`
        : `Error de red al contactar el API (POST /api/auth/login). ` +
            `Revisa CORS con credenciales en el backend, la política CSP connect-src del frontend y NEXT_PUBLIC_HEYDOCTOR_API_URL. ` +
            `URL usada: ${url}. Detalle: ${detail}`,
    );
  }

  if (typeof window !== "undefined") {
    logAuth.debug("login response", {
      status: res.status,
      ok: res.ok,
      url: res.url,
    });
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

  const accessFromBody = data.access_token;
  if (typeof accessFromBody === "string" && accessFromBody.trim()) {
    setAccessToken(accessFromBody.trim());
  } else {
    setAccessToken(null);
  }

  const u = (data.user ?? null) as Record<string, unknown> | null;
  if (!u || typeof u !== "object") {
    emitAuthTelemetry("login_fail", { status: res.status, reason: "no_user" });
    throw new Error("Respuesta de login inválida: falta user");
  }

  const fromNames = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  const fallback = fromNames || (u.email as string) || "";
  const name = (u.name as string) ?? fallback;

  const userId = String(u.id ?? "");
  if (!userId) {
    emitAuthTelemetry("login_fail", { status: res.status, reason: "no_user_id" });
    throw new Error("Respuesta de login inválida: falta user");
  }

  _lastHardRefreshFailAt = 0;
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

  cancelInFlightAuthRequests();

  try {
    if (!options?.skipRemote) {
      await fetchWithIncludedCredentials(`${getApiBase()}/auth/logout`, {
        method: "POST",
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
  _lastHardRefreshFailAt = 0;
  await clearFirstPartySessionCookie();
}

attachMultiTabAuthSync();
