/**
 * `fetch` con `credentials: "include"` forzado al final (cookies en orígenes cruzados).
 * No sustituye al `apiFetch` de `heydoctor-api` (JSON + reintento tras refresh).
 * No usar en rutas que requieran explícitamente `credentials: "omit"`.
 */

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
  return fetch(input, {
    ...init,
    credentials: "include",
  });
}
