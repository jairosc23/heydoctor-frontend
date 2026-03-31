import {
  getAccessToken,
  refreshAccessToken,
} from "./auth-client";
import { handleAuthError } from "./auth/auth-guard";
import { API_URL, getApiBase } from "./api-base";

export { API_URL, getApiBase };

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

/**
 * fetch con Bearer + credentials; en cliente ante 401 intenta refresh y reintenta una vez.
 * Si sigue 401 → handleAuthError (logout + redirect).
 */
export async function fetchWithAuth(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = buildAuthUrl(path);

  const buildHeaders = (): Headers => {
    const headers = new Headers(init.headers);
    const method = (init.method ?? "GET").toUpperCase();
    if (
      !headers.has("Content-Type") &&
      init.body !== undefined &&
      method !== "GET" &&
      method !== "HEAD"
    ) {
      headers.set("Content-Type", "application/json");
    }
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  };

  const doFetch = (): Promise<Response> =>
    fetch(url, {
      ...init,
      headers: buildHeaders(),
      credentials: "include",
    });

  let res = await doFetch();

  if (
    res.status === 401 &&
    typeof window !== "undefined" &&
    !isAuthRefreshRequest(url)
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
