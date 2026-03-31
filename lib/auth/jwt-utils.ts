/**
 * Decodifica el claim `exp` del JWT sin verificar firma (solo lectura de TTL).
 * Compatible con Node (route handlers) y navegador.
 */
export function getJwtRemainingSeconds(accessToken: string): number {
  const trimmed = accessToken.trim();
  const parts = trimmed.split(".");
  if (parts.length < 2) {
    return 15 * 60;
  }

  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLen);

  try {
    let json: string;
    if (typeof Buffer !== "undefined") {
      json = Buffer.from(padded, "base64").toString("utf8");
    } else {
      json = atob(padded);
    }
    const payload = JSON.parse(json) as { exp?: number };
    const exp = payload.exp;
    if (typeof exp !== "number") {
      return 15 * 60;
    }
    const now = Math.floor(Date.now() / 1000);
    return Math.max(60, exp - now);
  } catch {
    return 15 * 60;
  }
}

export function extractBearerToken(authorization: string | null): string | null {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }
  return authorization.slice(7).trim() || null;
}
