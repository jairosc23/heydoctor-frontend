/**
 * Cliente HTTP unificado al API Nest (HeyDoctor).
 *
 * - Sesión: cookies HttpOnly en el origen del API (`access_token`, `refresh_token`) con `credentials: 'include'`.
 * - Si hay JWT en memoria (legacy), se añade `Authorization: Bearer`.
 * - Interceptor 401: `POST /auth/refresh` → reintento de la petición.
 * - Datos clínicos / panel: `cache: "no-store"`.
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
    const refreshed = await refreshAccessToken();
    if (refreshed) {
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
