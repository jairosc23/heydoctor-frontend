/**
 * Canje de ?access_token= contra el Nest: POST /api/auth/magic-link con credentials.
 * El API fija `heydoctor_session` y `refresh_token` en su dominio (cross-origin).
 */

import { setAccessToken } from "@/lib/auth-client";
import { getApiBase } from "@/lib/api-base";
import { setFirstPartySessionFromAccessToken } from "@/lib/first-party-session-cookie";

export async function exchangeMagicLinkToken(token: string): Promise<void> {
  const trimmed = token.trim();
  if (!trimmed) {
    throw new Error("Token vacío");
  }

  const base = getApiBase();
  const res = await fetch(`${base}/auth/magic-link`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ token: trimmed }),
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(j.message)) {
        detail = j.message.join(", ");
      } else if (typeof j.message === "string") {
        detail = j.message;
      }
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Magic link ${res.status}`);
  }

  const data = (await res.json()) as { access_token?: string };
  const at = data.access_token?.trim();
  if (at) {
    setAccessToken(at);
    await setFirstPartySessionFromAccessToken(at);
  }
}
