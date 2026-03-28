import { getAccessToken } from "./auth-client";
import { API_URL, getApiBase } from "./api-base";

export { API_URL, getApiBase };

/**
 * fetch centralizado con Bearer (in-memory) y credentials: include (HttpOnly cookies).
 */
export async function fetchWithAuth(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const base = getApiBase();
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? path : `/${path}`}`;

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

  return fetch(url, { ...init, headers, credentials: "include" });
}
