/**
 * POST relativo a `/api/auth/session` — Route Handler de Next (mismo origen que el front).
 * Fija cookie HttpOnly `heydoctor_session` para que `proxy.ts` valide SSR en /panel.
 * Las cookies del Nest (`access_token` en pro-api) no son visibles en Edge/Vercel.
 */

import { apiFetch as fetchWithIncludedCredentials } from "./api-fetch-include";

export class FirstPartySessionError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "FirstPartySessionError";
  }
}

export async function setFirstPartySessionFromAccessToken(
  accessToken: string,
): Promise<void> {
  if (typeof window === "undefined") return;
  const token = accessToken.trim();
  if (!token) {
    throw new FirstPartySessionError(
      "access_token vacío: no se puede fijar heydoctor_session",
      0,
    );
  }

  const res = await fetchWithIncludedCredentials("/api/auth/session", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new FirstPartySessionError(
      `POST /api/auth/session falló (${res.status})`,
      res.status,
    );
  }
}
