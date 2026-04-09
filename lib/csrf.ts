import { getApiBase } from "./api-base";

/**
 * Double-submit CSRF: el token viaja en cookie `csrf_token` (dominio API) y en cabecera `X-CSRF-Token`.
 * En cross-origin el cliente no lee la cookie; sincroniza con `csrfToken` del JSON (login/refresh/GET /auth/csrf).
 */
let mem: string | null = null;
let inflight: Promise<string> | null = null;

export function setCsrfToken(token: string | null | undefined): void {
  const t = token?.trim() ?? "";
  mem = t.length > 0 ? t : null;
}

export function getCsrfTokenSync(): string | null {
  return mem;
}

export async function ensureCsrfToken(): Promise<string> {
  if (mem) {
    return mem;
  }
  if (!inflight) {
    inflight = (async () => {
      const res = await fetch(`${getApiBase()}/auth/csrf`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        throw new Error(`CSRF bootstrap failed (${res.status})`);
      }
      const data = (await res.json()) as { csrfToken?: string };
      const t = data.csrfToken?.trim() ?? "";
      if (!t) {
        throw new Error("CSRF bootstrap missing csrfToken");
      }
      mem = t;
      return t;
    })().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}
