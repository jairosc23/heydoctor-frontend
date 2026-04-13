/**
 * Canje de ?access_token= contra el Nest: POST /api/auth/magic-link (JWT en JSON).
 */

import { setAccessToken } from "@/lib/auth-client";
import { setFirstPartySessionFromAccessToken } from "@/lib/first-party-session-cookie";
import { heydoctorApi } from "@/lib/heydoctor-api";

export async function exchangeMagicLinkToken(token: string): Promise<void> {
  const trimmed = token.trim();
  if (!trimmed) {
    throw new Error("Token vacío");
  }

  const data = await heydoctorApi.post<{
    access_token?: string;
  }>("/auth/magic-link", { token: trimmed }, { requireAuth: false });

  const at = data.access_token?.trim();
  if (at) {
    setAccessToken(at);
    await setFirstPartySessionFromAccessToken(at);
  }
}
