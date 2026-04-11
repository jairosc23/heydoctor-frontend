/**
 * Canje de ?access_token= contra el Nest: POST /api/auth/magic-link (fetchWithAuth vía apiPost).
 * El API fija `refresh_token` y devuelve access JWT en JSON (cross-origin).
 */

import { setAccessToken } from "@/lib/auth-client";
import { apiPost } from "@/lib/api-client";
import { setFirstPartySessionFromAccessToken } from "@/lib/first-party-session-cookie";
import { setCsrfToken } from "@/lib/csrf";

export async function exchangeMagicLinkToken(token: string): Promise<void> {
  const trimmed = token.trim();
  if (!trimmed) {
    throw new Error("Token vacío");
  }

  const data = await apiPost<{
    access_token?: string;
    csrfToken?: string;
  }>("/auth/magic-link", { token: trimmed });

  const csrf = data.csrfToken?.trim();
  if (csrf) {
    setCsrfToken(csrf);
  }
  const at = data.access_token?.trim();
  if (at) {
    setAccessToken(at);
    await setFirstPartySessionFromAccessToken(at);
  }
}
