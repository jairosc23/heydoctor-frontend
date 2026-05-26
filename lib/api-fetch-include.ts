/**
 * `fetch` con `credentials: "include"` forzado al final (cookies en orígenes cruzados).
 * Si hay JWT en RAM (`auth-access-memory`), añade `Authorization: Bearer` como fallback
 * cuando las cookies HttpOnly no se almacenan (políticas third-party).
 * No usar en rutas que requieran explícitamente `credentials: "omit"`.
 */

import { getAccessToken } from "./auth-access-memory";

/** No enviar Bearer de access JWT aquí: el Nest usa Bearer en refresh solo para el refresh token. */
function isAuthRefreshRequest(input: RequestInfo | URL): boolean {
  const s =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? `${input.pathname}${input.search}`
        : "";
  return /\b\/auth\/refresh\b/i.test(String(s));
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  if (
    init.credentials != null &&
    init.credentials !== "include" &&
    typeof console !== "undefined"
  ) {
    console.warn(
      "[apiFetch] Overriding credentials to include (was:",
      init.credentials,
      ")",
    );
  }
  const headers = new Headers(init.headers ?? undefined);
  const bearer = getAccessToken();
  if (bearer && !isAuthRefreshRequest(input)) {
    headers.set("Authorization", `Bearer ${bearer}`);
  }
  return fetch(input, {
    ...init,
    credentials: "include",
    headers,
  });
}
