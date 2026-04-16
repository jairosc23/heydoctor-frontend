/**
 * Cliente HTTP unificado al API Nest (HeyDoctor).
 *
 * - Access token: `localStorage["heydoctor_access_token"]` vía `auth-client` (memoria + storage).
 * - Cada petición: `Authorization: Bearer` + `credentials: 'include'` (cookie HttpOnly `refresh_token` en el origen del API).
 * - Interceptor 401: `POST /api/auth/refresh` con promesa compartida (`dedupedRefresh`) para evitar tormentas de refresh concurrentes → reintento de la petición.
 * - Datos clínicos / panel: `cache: "no-store"`. Listados públicos de doctores en RSC: `lib/server/public-doctors.ts` con `revalidate: 60`.
 */

import { getAccessToken, refreshAccessToken } from "./auth-client";
import { handleAuthError } from "./auth/auth-guard";
import { getApiBase } from "./api-base";

export {
  getApiBase,
  getAuthLoginUrl,
  getAuthMeUrl,
  getBackendOrigin,
} from "./api-base";

export { HEYDOCTOR_ACCESS_TOKEN_STORAGE_KEY } from "./heydoctor-auth-constants";

/** Una sola operación de refresh en vuelo por pestaña (varios 401 concurrentes comparten la misma promesa). */
let refreshPromise: Promise<string | null> | null = null;

function dedupedRefresh(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }
  refreshPromise = refreshAccessToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

function buildAuthUrl(path: string): string {
  const base = getApiBase();
  return path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function isAuthRefreshRequest(url: string): boolean {
  try {
    const pathname = new URL(url).pathname.replace(/\/$/, "");
    return pathname.endsWith("/auth/refresh");
  } catch {
    return url.includes("/auth/refresh");
  }
}

export type FetchWithAuthContext = {
  /** @deprecated Ignorado; el Bearer sale de getAccessToken. */
  bearerToken?: string;
  /**
   * Si es true, exige token antes del fetch. Por defecto true en apiFetch.
   */
  requireAuth?: boolean;
};

/** @deprecated Usar FetchWithAuthContext. */
export type ApiAuthOptions = FetchWithAuthContext;

/**
 * Peticiones al API Nest: URL absoluta, Authorization Bearer, credentials para refresh cookie.
 * Ante 401 intenta refresh y reintenta. `cache: 'no-store'` para datos dinámicos.
 */
export async function fetchWithAuth(
  path: string,
  init: RequestInit = {},
  ctx?: FetchWithAuthContext,
): Promise<Response> {
  const url = buildAuthUrl(path);
  const isRefreshEndpoint = isAuthRefreshRequest(url);

  if (ctx?.requireAuth) {
    const t = getAccessToken()?.trim();
    if (!t) {
      throw new Error("No auth token available");
    }
  }

  const buildHeaders = async (): Promise<Headers> => {
    const headers = new Headers(init.headers);
    const method = (init.method ?? "GET").toUpperCase();
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }
    if (
      !headers.has("Content-Type") &&
      init.body !== undefined &&
      method !== "GET" &&
      method !== "HEAD"
    ) {
      headers.set("Content-Type", "application/json");
    }
    const bearer = getAccessToken()?.trim();
    if (bearer && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${bearer}`);
    }
    return headers;
  };

  const doFetch = async (): Promise<Response> =>
    fetch(url, {
      ...init,
      headers: await buildHeaders(),
      credentials: "include",
      cache: "no-store",
    });

  let res = await doFetch();

  if (
    res.status === 401 &&
    typeof window !== "undefined" &&
    !isRefreshEndpoint
  ) {
    if (process.env.NODE_ENV === "development" && typeof console !== "undefined" && console.error) {
      console.error("[heydoctor-api] 401 Unauthorized — attempting refresh:", url);
    }
    const newToken = await dedupedRefresh();
    if (newToken) {
      res = await doFetch();
    }
    // Un segundo 401 tras refresh implica sesión inválida; no bucle de refresh.
    if (res.status === 401) {
      if (process.env.NODE_ENV === "development" && typeof console !== "undefined" && console.error) {
        console.error("[heydoctor-api] 401 after refresh — session cleared:", url);
      }
      await handleAuthError();
      throw new Error("SESSION_EXPIRED");
    }
  }

  return res;
}

export function requireAccessToken(): string {
  const t = getAccessToken()?.trim();
  if (!t) {
    throw new Error("No auth token available");
  }
  return t;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const raw =
      (data as { message?: unknown })?.message ??
      (data as { error?: unknown })?.error;
    let msg: string;
    if (Array.isArray(raw)) {
      msg = raw.map(String).filter(Boolean).join(", ");
    } else if (typeof raw === "string") {
      msg = raw;
    } else if (raw != null) {
      msg = String(raw);
    } else {
      msg = `Error ${res.status}: ${res.statusText}`;
    }
    throw new ApiError(msg, res.status, data);
  }

  return data as T;
}

function mergeAuthOptions(auth?: ApiAuthOptions): ApiAuthOptions {
  return {
    requireAuth: auth?.requireAuth !== false,
    ...auth,
  };
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  auth?: ApiAuthOptions,
): Promise<T> {
  let res: Response;
  try {
    res = await fetchWithAuth(path, options, mergeAuthOptions(auth));
  } catch (err) {
    if (err instanceof Error && err.message === "SESSION_EXPIRED") {
      throw new ApiError("Sesión expirada", 401);
    }
    throw err;
  }

  return parseResponse<T>(res);
}

export async function apiGet<T = unknown>(
  path: string,
  auth?: ApiAuthOptions,
): Promise<T> {
  return apiFetch<T>(path, { method: "GET" }, auth);
}

type ApiPostOptions = { signal?: AbortSignal } & ApiAuthOptions;

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
  options?: AbortSignal | ApiPostOptions,
): Promise<T> {
  const opts: ApiPostOptions | undefined =
    options instanceof AbortSignal ? { signal: options } : options;
  const signal = opts?.signal;
  const auth: ApiAuthOptions | undefined =
    opts && (opts.requireAuth !== undefined || opts.bearerToken !== undefined)
      ? {
          requireAuth: opts.requireAuth,
          bearerToken: opts.bearerToken,
        }
      : undefined;

  return apiFetch<T>(
    path,
    {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    },
    auth,
  );
}

export async function apiPatch<T = unknown>(
  path: string,
  body?: unknown,
  auth?: ApiAuthOptions,
): Promise<T> {
  return apiFetch<T>(
    path,
    {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    },
    auth,
  );
}

export async function apiDelete<T = unknown>(
  path: string,
  auth?: ApiAuthOptions,
): Promise<T> {
  return apiFetch<T>(path, { method: "DELETE" }, auth);
}

export async function apiGetOrFallback<T>(
  path: string,
  fallback: T,
  auth?: ApiAuthOptions,
): Promise<T> {
  try {
    return await apiGet<T>(path, auth);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return fallback;
    throw err;
  }
}

export async function apiPostOrFallback<T>(
  path: string,
  body: unknown,
  fallback: T,
  auth?: ApiAuthOptions,
): Promise<T> {
  try {
    return await apiPost<T>(path, body, auth);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return fallback;
    throw err;
  }
}

export const heydoctorApi = {
  fetch: apiFetch,
  get: apiGet,
  post: apiPost,
  patch: apiPatch,
  delete: apiDelete,
  getOrFallback: apiGetOrFallback,
  postOrFallback: apiPostOrFallback,
} as const;
