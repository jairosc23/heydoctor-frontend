/**
 * Cliente HTTP sobre fetchWithAuth: JSON, 401 → auto-refresh → retry.
 */

import { fetchWithAuth } from "./api";
import {
  getAccessToken,
  refreshAccessToken,
  authLogout,
} from "./auth-client";

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
    const msg =
      (data as { message?: string })?.message ??
      (data as { error?: string })?.error ??
      `Error ${res.status}: ${res.statusText}`;
    throw new ApiError(String(msg), res.status, data);
  }

  return data as T;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!getAccessToken()) {
    await refreshAccessToken();
  }

  let res = await fetchWithAuth(path, options);

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await fetchWithAuth(path, options);
      if (res.status !== 401) {
        return parseResponse<T>(res);
      }
    }

    await authLogout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError("No autorizado", 401);
  }

  return parseResponse<T>(res);
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "GET" });
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
