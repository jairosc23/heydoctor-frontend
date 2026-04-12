import { getAccessToken, refreshAccessToken } from "./auth-client";
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
  /** @deprecated Usar token en memoria vía getAccessToken; este campo se ignora. */
  bearerToken?: string;
};

/**
 * Peticiones al API Nest: `credentials: 'include'` (cookie `refresh_token`) y, si hay token en memoria,
 * `Authorization: Bearer` (access JWT tras login/refresh). Ante 401 (salvo /auth/refresh) intenta refresh y reintenta.
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
