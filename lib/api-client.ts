/**
 * Cliente HTTP sobre fetchWithAuth: JSON; 401 + refresh ya resuelto en fetchWithAuth.
 */

import { fetchWithAuth, type FetchWithAuthContext } from "./api";

/** @deprecated Mantenido por compatibilidad de firmas; el Bearer sale de getAccessToken en fetchWithAuth. */
export type ApiAuthOptions = FetchWithAuthContext;

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
    if (
      res.status === 403 &&
      (raw === "Invalid CSRF token" ||
        (typeof raw === "string" && raw.includes("CSRF")))
    ) {
      throw new ApiError(
        "Token de seguridad no válido o caducado. Recarga la página e inténtalo de nuevo.",
        403,
        data
      );
    }
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
