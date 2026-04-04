import {
  getAccessToken,
  refreshAccessToken,
} from "./auth-client";
import { handleAuthError } from "./auth/auth-guard";
import { getApiBase } from "./api-base";

export { getApiBase };

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
  /** Si se pasa (p. ej. recién emitido en login), se usa para Authorization antes que `getAccessToken()`. */
  bearerToken?: string;
};

/**
 * fetch con Bearer + credentials; en cliente ante 401 intenta refresh y reintenta una vez.
 * Si sigue 401 → handleAuthError (logout + redirect).
 */
export async function fetchWithAuth(
  path: string,
  init: RequestInit = {},
  ctx?: FetchWithAuthContext,
): Promise<Response> {
  const url = buildAuthUrl(path);
  let bearerOverride = ctx?.bearerToken?.trim() ?? "";

  const buildHeaders = (): Headers => {
    const current = (bearerOverride || getAccessToken()?.trim() || "").trim();
    if (process.env.NODE_ENV === "development") {
      console.log(
        "TOKEN EN FETCH:",
        current ? `${current.slice(0, 12)}…(${current.length})` : null,
      );
    }
    if (!current) {
      throw new Error("No access token available");
    }

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
    headers.set("Authorization", `Bearer ${current}`);
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
    bearerOverride = "";
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
