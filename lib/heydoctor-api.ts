/**
 * Cliente HTTP unificado al API Nest (HeyDoctor).
 *
 * - Sesión solo vía cookies HttpOnly (`access_token`, `refresh_token`) y `credentials: 'include'`.
 * - Sin cabecera `Authorization` / Bearer desde el cliente.
 * - Mutaciones: `X-CSRF-Token` + `X-Requested-With: XMLHttpRequest`.
 * - 401: `POST /auth/refresh` y reintento; datos dinámicos con `cache: "no-store"`.
 */

import { bootstrapApiCsrf, refreshAccessToken } from "./auth-client";
import { apiFetch as fetchWithIncludedCredentials } from "./api-fetch-include";
import { handleAuthError } from "./auth/auth-guard";
import { getApiBase } from "./api-base";
import {
  getApiCsrfToken,
  API_CSRF_HEADER,
  API_X_REQUESTED_WITH,
  API_XRW_XMLHTTPREQUEST,
} from "./api-csrf";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isUnsafeMethod(method?: string): boolean {
  return UNSAFE_METHODS.has((method ?? "GET").toUpperCase());
}

function isCsrfFailure(status: number, body?: unknown): boolean {
  if (status !== 403) return false;
  const text = typeof body === "string" ? body : JSON.stringify(body ?? "");
  return /csrf/i.test(text);
}

export {
  getApiBase,
  getAuthCsrfUrl,
  getAuthLoginUrl,
  getAuthMeUrl,
  getBackendOrigin,
} from "./api-base";

export { HEYDOCTOR_ACCESS_TOKEN_STORAGE_KEY } from "./heydoctor-auth-constants";

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
  /**
   * Reservado para rutas públicas (`false`). No implica Bearer; la sesión son cookies.
   */
  requireAuth?: boolean;
};

/** @deprecated Usar FetchWithAuthContext. */
export type ApiAuthOptions = FetchWithAuthContext;

/**
 * Peticiones al API Nest: URL absoluta, `credentials: 'include'`, sin Bearer.
 * Ante 401 intenta refresh y reintenta. `cache: 'no-store'` para datos dinámicos.
 */
export async function fetchWithAuth(
  path: string,
  init: RequestInit = {},
  ctx?: FetchWithAuthContext,
): Promise<Response> {
  const url = buildAuthUrl(path);
  const isRefreshEndpoint = isAuthRefreshRequest(url);
  const method = (init.method ?? "GET").toUpperCase();
  const unsafe = isUnsafeMethod(method);
  const isCsrfBootstrapEndpoint = url.endsWith("/auth/csrf");

  if (unsafe && !isRefreshEndpoint && !getApiCsrfToken()) {
    await bootstrapApiCsrf();
  }

  const buildHeaders = (): Headers => {
    const headers = new Headers(init.headers);
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
    if (unsafe && !headers.has(API_X_REQUESTED_WITH)) {
      headers.set(API_X_REQUESTED_WITH, API_XRW_XMLHTTPREQUEST);
    }
    const csrf = getApiCsrfToken();
    if (unsafe && csrf && !headers.has(API_CSRF_HEADER)) {
      headers.set(API_CSRF_HEADER, csrf);
    }
    if (
      process.env.NODE_ENV === "development" &&
      unsafe &&
      typeof console !== "undefined"
    ) {
      console.log("[heydoctor-api]", method, url, {
        csrfPresent: Boolean(csrf),
        csrfHeader: API_CSRF_HEADER,
      });
    }
    return headers;
  };

  const doFetch = async (): Promise<Response> =>
    fetchWithIncludedCredentials(url, {
      ...init,
      headers: buildHeaders(),
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
    let refreshedOnce = false;
    try {
      refreshedOnce = await refreshAccessToken();
    } catch {
      refreshedOnce = false;
    }
    let refreshed = refreshedOnce;
    if (!refreshed) {
      await new Promise((r) => setTimeout(r, 150));
      try {
        refreshed = await refreshAccessToken();
      } catch {
        refreshed = false;
      }
    }
    if (refreshed) {
      res = await doFetch();
    }
    if (res.status === 401) {
      if (process.env.NODE_ENV === "development" && typeof console !== "undefined" && console.error) {
        console.error("[heydoctor-api] 401 after refresh — session cleared:", url);
      }
      await handleAuthError();
      throw new Error("SESSION_EXPIRED");
    }
  }

  if (res.status === 403 && unsafe && !isCsrfBootstrapEndpoint) {
    let bodyText: string | null = null;
    try {
      bodyText = await res.clone().text();
    } catch {
      bodyText = null;
    }
    if (isCsrfFailure(res.status, bodyText)) {
      if (process.env.NODE_ENV === "development" && typeof console !== "undefined" && console.warn) {
        console.warn("[heydoctor-api] 403 CSRF — re-bootstrapping and retrying:", url);
      }
      await bootstrapApiCsrf();
      if (getApiCsrfToken()) {
        res = await doFetch();
      }
    }
  }

  return res;
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

/** Cuerpo JSON típico de Nest (`message` string | string[] | `error`). */
function extractMessageFromNestBody(body: unknown): string | null {
  if (body == null) {
    return null;
  }
  if (typeof body === "string" && body.trim()) {
    return body.trim();
  }
  if (typeof body !== "object") {
    return null;
  }
  const o = body as Record<string, unknown>;
  const msg = o.message;
  if (Array.isArray(msg)) {
    const joined = msg.map(String).filter(Boolean).join(". ");
    return joined || null;
  }
  if (typeof msg === "string" && msg.trim()) {
    return msg.trim();
  }
  if (msg != null && typeof msg !== "object") {
    const s = String(msg).trim();
    return s || null;
  }
  const errField = o.error;
  if (typeof errField === "string" && errField.trim()) {
    return errField.trim();
  }
  return null;
}

function messageFromFailedResponse(
  data: unknown,
  status: number,
  statusText: string,
): string {
  const fromBody = extractMessageFromNestBody(data);
  if (fromBody) {
    return fromBody;
  }
  return `Error ${status}: ${statusText || "solicitud fallida"}`;
}

/** Evita mostrar el texto genérico en inglés que Nest usa en producción para 500. */
function humanizeGenericServerMessage(
  message: string,
  status?: number,
): string {
  const m = message.trim().toLowerCase();
  if (
    m === "internal server error" ||
    (status === 500 && m.startsWith("error 500"))
  ) {
    return "Error del servidor. Revisa la conexión o inténtalo más tarde.";
  }
  return message.trim();
}

/**
 * Mensaje para mostrar en UI ante fallos del API (fetch + ApiError; compatible con forma axios `error.response.data`).
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Ha ocurrido un error",
): string {
  if (error instanceof ApiError) {
    const fromBody = extractMessageFromNestBody(error.body);
    if (fromBody) {
      return humanizeGenericServerMessage(fromBody, error.status);
    }
    if (error.message?.trim()) {
      return humanizeGenericServerMessage(error.message, error.status);
    }
    return fallback;
  }
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    const data = response?.data;
    const fromBody = extractMessageFromNestBody(data);
    if (fromBody) {
      return fromBody;
    }
  }
  if (error instanceof Error && error.message?.trim()) {
    return error.message.trim();
  }
  return fallback;
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
    const msg = messageFromFailedResponse(data, res.status, res.statusText);
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
    opts && opts.requireAuth !== undefined
      ? { requireAuth: opts.requireAuth }
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
