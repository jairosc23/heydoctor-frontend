/**
 * MFA enroll/verify against Nest. Uses the RAM pending JWT as Bearer.
 * Never attaches the staff session access token.
 */
import { AUTH_REQUEST_TIMEOUT_MS } from "./async/auth-request-config";
import { fetchWithTimeout } from "./async/fetch-with-timeout";
import { getAuthEdgeUrl } from "./auth-edge";
import {
  applyCsrfFromPayload,
  API_CSRF_HEADER,
  API_X_REQUESTED_WITH,
  API_XRW_XMLHTTPREQUEST,
  getApiCsrfToken,
} from "./api-csrf";
import { apiFetch } from "./api-fetch-include";
import { setAccessToken } from "./auth-access-memory";
import {
  clearMfaPendingState,
  getMfaPendingToken,
} from "./auth-mfa-pending-memory";

function mfaHeaders(): Record<string, string> {
  const token = getMfaPendingToken();
  if (!token) {
    throw new Error(
      "La verificación en dos pasos expiró. Vuelve a iniciar sesión.",
    );
  }
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    [API_X_REQUESTED_WITH]: API_XRW_XMLHTTPREQUEST,
  };
  const csrf = getApiCsrfToken();
  if (csrf) {
    headers[API_CSRF_HEADER] = csrf;
  }
  return headers;
}

async function readJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function errorMessage(res: Response, data: Record<string, unknown>): string {
  const raw = data.message ?? data.error;
  if (typeof raw === "string" && raw.trim()) {
    return raw.trim();
  }
  if (res.status === 401) {
    return "Código inválido o expirado.";
  }
  if (res.status === 503) {
    return "La verificación en dos pasos no está disponible.";
  }
  return `Error HTTP ${res.status}`;
}

export async function startMfaEnrollment(): Promise<{ otpauthUri: string }> {
  const res = await fetchWithTimeout(
    getAuthEdgeUrl("/auth/mfa/enroll/start"),
    { method: "POST", headers: mfaHeaders(), credentials: "include" },
    { timeoutMs: AUTH_REQUEST_TIMEOUT_MS, fetchImpl: apiFetch },
  );
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(errorMessage(res, data));
  }
  const otpauthUri =
    typeof data.otpauthUri === "string" ? data.otpauthUri.trim() : "";
  if (!otpauthUri.startsWith("otpauth://")) {
    throw new Error("No se pudo iniciar el enrolamiento MFA.");
  }
  return { otpauthUri };
}

export async function confirmMfaEnrollment(
  code: string,
): Promise<{ backupCodes: string[] }> {
  const res = await fetchWithTimeout(
    getAuthEdgeUrl("/auth/mfa/enroll/confirm"),
    {
      method: "POST",
      headers: mfaHeaders(),
      credentials: "include",
      body: JSON.stringify({ code: code.trim() }),
    },
    { timeoutMs: AUTH_REQUEST_TIMEOUT_MS, fetchImpl: apiFetch },
  );
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(errorMessage(res, data));
  }
  const backupCodes = Array.isArray(data.backupCodes)
    ? data.backupCodes.filter(
        (c): c is string => typeof c === "string" && c.length > 0,
      )
    : [];
  if (backupCodes.length === 0) {
    throw new Error("No se recibieron códigos de respaldo.");
  }
  return { backupCodes };
}

export async function verifyMfaChallenge(code: string): Promise<void> {
  const res = await fetchWithTimeout(
    getAuthEdgeUrl("/auth/mfa/verify"),
    {
      method: "POST",
      headers: mfaHeaders(),
      credentials: "include",
      body: JSON.stringify({ code: code.trim() }),
    },
    { timeoutMs: AUTH_REQUEST_TIMEOUT_MS, fetchImpl: apiFetch },
  );
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error(errorMessage(res, data));
  }
  applyCsrfFromPayload(data);
  const access =
    typeof data.access_token === "string" ? data.access_token.trim() : "";
  if (access) {
    setAccessToken(access);
  }
  clearMfaPendingState();
}
