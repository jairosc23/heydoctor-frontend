/**
 * POST relativo a `/api/auth/session` — **ruta del propio Next.js** (Route Handler), no del Nest.
 * El handler del frontend llama a GET `${NEXT_PUBLIC_API_URL}/api/auth/me` en el servidor.
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
