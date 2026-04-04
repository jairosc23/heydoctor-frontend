/**
 * POST relativo a `/api/auth/session` (solo origen Next).
 * Usado tras login, refresh y cualquier nuevo access_token en cliente.
 */

export async function setFirstPartySessionFromAccessToken(
  accessToken: string,
): Promise<void> {
  if (typeof window === "undefined") return;
  const token = accessToken.trim();
  if (!token) return;

  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });

  if (!res.ok && process.env.NODE_ENV === "development") {
    console.warn(
      "[session] POST /api/auth/session",
      res.status,
    );
  }
}
