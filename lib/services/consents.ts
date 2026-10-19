/**
 * Consentimiento de telemedicina del MÉDICO en sesión.
 *
 * El backend (NestJS) exige un consentimiento firmado por el doctor (usuario logueado)
 * en la versión vigente antes de permitir crear consultas:
 *   - GET  /api/consents/telemedicine/status → { hasConsent, version }
 *   - POST /api/consents/telemedicine        → registra consentimiento idempotente
 *
 * Si no existe registro, `POST /api/consultations` responde 403 con:
 *   { message: "Consent required before consultation", error: "Forbidden", statusCode: 403 }
 */

import { ApiError, heydoctorApi } from "../heydoctor-api";

const BASE = "/consents";

export interface TelemedicineConsentStatus {
  hasConsent: boolean;
  version: string;
}

export interface TelemedicineConsentView {
  id: string;
  userId: string;
  clinicId: string;
  consentGivenAt: string;
  version: string;
  createdAt: string;
}

export async function fetchTelemedicineConsentStatus(): Promise<TelemedicineConsentStatus> {
  return heydoctorApi.get<TelemedicineConsentStatus>(
    `${BASE}/telemedicine/status`,
  );
}

export async function recordTelemedicineConsent(): Promise<TelemedicineConsentView> {
  return heydoctorApi.post<TelemedicineConsentView>(
    `${BASE}/telemedicine`,
    undefined,
  );
}

/** Detecta el 403 específico que el backend lanza si falta el consentimiento. */
export function isConsentRequiredError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  if (err.status !== 403) return false;
  const body = err.body;
  const text =
    typeof body === "string"
      ? body
      : body && typeof body === "object"
        ? JSON.stringify(body)
        : "";
  return /consent\s+required/i.test(text) || /consent\s+required/i.test(err.message);
}
