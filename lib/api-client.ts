/**
 * Cliente HTTP al Nest: `fetchWithAuth` (JWT vía auth-client) + helpers JSON.
 */

import { getAccessToken, refreshAccessToken } from "./auth-client";
import { handleAuthError } from "./auth/auth-guard";
import { getApiBase } from "./api-base";

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
  /** @deprecated Usar token en memoria vía getAccessToken; este campo se ignora. */
  bearerToken?: string;
};

/** @deprecated Mantenido por compatibilidad de firmas; el Bearer sale de getAccessToken en fetchWithAuth. */
export type ApiAuthOptions = FetchWithAuthContext;

/**
 * Peticiones al API Nest: `credentials: 'include'` y `Authorization: Bearer` desde auth-client
 * (`heydoctor_access_token` en localStorage + memoria). Ante 401 intenta refresh y reintenta.
 */
export async function fetchWithAuth(
  path: string,
  init: RequestInit = {},
  _ctx?: FetchWithAuthContext,
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
    });

  let res = await doFetch();

  if (
    res.status === 401 &&
    typeof window !== "undefined" &&
    !isRefreshEndpoint
  ) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch();
    }
    if (res.status === 401) {
      await handleAuthError();
      throw new Error("SESSION_EXPIRED");
    }
  }

  return res;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
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

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  auth?: ApiAuthOptions,
): Promise<T> {
  let res: Response;
  try {
    res = await fetchWithAuth(path, options, auth);
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

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
  signal?: AbortSignal
): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });
}

export async function apiPatch<T = unknown>(
  path: string,
  body?: unknown
): Promise<T> {
  return apiFetch<T>(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T = unknown>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "DELETE" });
}

export async function apiGetOrFallback<T>(path: string, fallback: T): Promise<T> {
  try {
    return await apiGet<T>(path);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return fallback;
    throw err;
  }
}

export async function apiPostOrFallback<T>(path: string, body: unknown, fallback: T): Promise<T> {
  try {
    return await apiPost<T>(path, body);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return fallback;
    throw err;
  }
}
