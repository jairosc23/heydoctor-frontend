/**
 * POST relativo a `/api/auth/session` — Route Handler de Next (mismo origen que el front).
 * Solo fija cookie HttpOnly en Vercel a partir del Bearer que el **cliente** obtuvo del Nest;
 * no reenvía el login ni llama al API desde el servidor.
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
