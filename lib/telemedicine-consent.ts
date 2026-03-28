import { getApiBase } from "./api-base";

/**
 * Consentimiento para consulta por videollamada (telemedicina).
 *
 * **Fuente de verdad:** backend — `GET /consents/telemedicine/status` y
 * `POST /consents/telemedicine`.
 *
 * **`localStorage`** (`heydoctor_telemedicine_consent`) es solo caché de UX: debe
 * alinearse con la respuesta del servidor; si el backend indica `hasConsent: false`,
 * se limpia aunque la caché diga lo contrario.
 *
 * Revocación en cliente: {@link clearTelemedicineConsent}.
 */

export const TELEMEDICINE_CONSENT_STORAGE_KEY = "heydoctor_telemedicine_consent";

export type TelemedicineConsentRecord = {
  id: string;
  userId: string;
  clinicId: string;
  consentGivenAt: string;
  version: string;
  createdAt: string;
};

export type TelemedicineConsentStatus = {
  hasConsent: boolean;
  version: string;
};

/**
 * Estado del consentimiento según el servidor (versión legal vigente en backend).
 */
export async function getTelemedicineConsentStatus(
  accessToken: string
): Promise<TelemedicineConsentStatus> {
  const base = getApiBase();
  const res = await fetch(`${base}/consents/telemedicine/status`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  return (await res.json()) as TelemedicineConsentStatus;
}

async function readApiErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as { message?: string | string[] };
    if (Array.isArray(j.message)) return j.message.join(", ");
    if (typeof j.message === "string") return j.message;
  } catch {
    /* ignore */
  }
  return text.trim() || `Error ${res.status}`;
}

/**
 * Persiste el consentimiento en el servidor (auditoría legal).
 * Usar el mismo JWT que para el resto de la sesión (p. ej. token de query en teleconsulta).
 */
export async function postTelemedicineConsent(
  accessToken: string
): Promise<TelemedicineConsentRecord> {
  const base = getApiBase();
  const res = await fetch(`${base}/consents/telemedicine`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(await readApiErrorMessage(res));
  }
  return (await res.json()) as TelemedicineConsentRecord;
}

/**
 * Solo lectura de caché local; no usar para decisiones de negocio sin validar con
 * {@link getTelemedicineConsentStatus}.
 */
export function readTelemedicineConsentCache(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(TELEMEDICINE_CONSENT_STORAGE_KEY) === "true";
}

/** @deprecated Usar {@link readTelemedicineConsentCache}; el backend decide validez. */
export function hasTelemedicineConsent(): boolean {
  return readTelemedicineConsentCache();
}

export function setTelemedicineConsent(accepted: boolean): void {
  if (typeof window === "undefined") return;
  if (accepted) {
    localStorage.setItem(TELEMEDICINE_CONSENT_STORAGE_KEY, "true");
  } else {
    localStorage.removeItem(TELEMEDICINE_CONSENT_STORAGE_KEY);
  }
}

/** Revocación del consentimiento (p. ej. ajustes de cuenta en el futuro). */
export function clearTelemedicineConsent(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TELEMEDICINE_CONSENT_STORAGE_KEY);
}
