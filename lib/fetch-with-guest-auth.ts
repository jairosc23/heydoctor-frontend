/**
 * Guest Credential Channel HTTP client (ARCH-REM-01).
 * - credentials: omit (never Staff cookies)
 * - Authorization: Bearer from guest-signaling-memory
 * - Never calls /auth/refresh or Staff logout handlers
 */

import { getGuestSignalingToken } from "@/lib/guest-signaling-memory";

export class GuestAuthError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "GuestAuthError";
  }
}

export async function fetchWithGuestAuth(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = getGuestSignalingToken();
  if (!token) {
    throw new GuestAuthError("Guest signaling token missing", 401);
  }

  const headers = new Headers(init.headers ?? undefined);
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  return fetch(input, {
    ...init,
    credentials: "omit",
    headers,
  });
}
