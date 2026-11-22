import { getAuthEdgeUrl } from "./auth-edge";
import { getAccessToken } from "./auth-access-memory";
import { getApiCsrfToken, API_CSRF_HEADER, API_X_REQUESTED_WITH, API_XRW_XMLHTTPREQUEST } from "./api-csrf";
import { apiFetch } from "./api-fetch-include";
import { bootstrapApiCsrf } from "./auth-client";

/**
 * Active FULL staff JWT only (not a pending MFA token).
 * Never log, persist, cache, or broadcast recovery codes or TOTP.
 */
export async function rotateMfaBackupCodes(freshTotp: string): Promise<string[]> {
  if (!/^\d{6}$/.test(freshTotp.trim())) {
    throw new Error("Ingresa un código de seis dígitos de tu autenticador.");
  }
  await bootstrapApiCsrf();
  const csrf = getApiCsrfToken();
  if (!csrf) throw new Error("No se pudo obtener protección CSRF. Actualiza la sesión.");
  const jwt = getAccessToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    [API_CSRF_HEADER]: csrf,
    [API_X_REQUESTED_WITH]: API_XRW_XMLHTTPREQUEST,
  };
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  const res = await apiFetch(getAuthEdgeUrl("/auth/mfa/backup-codes/rotate"), {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers,
    body: JSON.stringify({ code: freshTotp.trim() }),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Código TOTP incorrecto o ya utilizado. Ingresa uno nuevo.");
    if (res.status === 403) throw new Error("Esta sesión no tiene permiso para regenerar códigos.");
    if (res.status === 429) throw new Error("Demasiados intentos. Intenta más tarde.");
    throw new Error("No se pudo reemplazar los códigos. Los anteriores pueden seguir activos.");
  }
  const payload: unknown = await res.json();
  if (!payload || typeof payload !== "object" || !("backupCodes" in payload)) {
    throw new Error("El servidor no confirmó los códigos nuevos. No repitas la operación a ciegas.");
  }
  const codes = (payload as { backupCodes: unknown }).backupCodes;
  if (!Array.isArray(codes) || codes.length !== 8 || !codes.every((v) => typeof v === "string" && /^[a-f0-9]{32}$/.test(v))) {
    throw new Error("Respuesta de recuperación inválida. No repitas sin comprobar el estado.");
  }
  return codes as string[];
}
