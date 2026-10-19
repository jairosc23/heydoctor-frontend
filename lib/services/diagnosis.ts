import {
  buildSoapPatch,
  diagnosisStateFromText,
} from "./consultation-diagnosis";
import { updateConsultation } from "./consultations";

export interface CreateDiagnosisDto {
  consultationId: string;
  clinicalRecordId?: string;
  patientId?: string;
  clinicId?: string;
  cie10CodeId?: string;
  diagnostic_date: string;
  /** Clinical description or "CODE - Description" when cie10CodeId not used */
  diagnosis_details?: string;
}

export interface SaveDiagnosisInput {
  diagnosis: string;
  cie10CodeId: string;
}

/** Parsea "I10 - Hipertensión esencial" cuando no hay relación cie10Code cargada. */
export function parseDiagnosisLabel(
  text: string,
): { code: string; description: string } | null {
  const trimmed = text.trim();
  // ASCII hyphen, en-dash and em-dash (PDFs / Copilot labels use —).
  const match = trimmed.match(/^([A-Za-z][A-Za-z0-9.]+)\s*[-–—]\s*(.+)$/);
  if (!match) return null;
  return { code: match[1], description: match[2].trim() };
}

/**
 * Persiste el diagnóstico CIE-10 en la consulta Nest (`PATCH /consultations/:id`).
 * El endpoint legacy `POST /diagnosis` no existe en el backend actual.
 */
export async function createDiagnosis(dto: CreateDiagnosisDto) {
  const consultationId = dto.consultationId?.trim();
  if (!consultationId) {
    throw new Error("consultationId is required");
  }
  const diagnosis = dto.diagnosis_details?.trim();
  if (!diagnosis) {
    throw new Error("diagnosis_details is required");
  }

  const diagnosisState = diagnosisStateFromText(diagnosis, dto.cie10CodeId);
  const updated = await updateConsultation(
    consultationId,
    buildSoapPatch({ diagnosis: diagnosisState }),
  );
  return { data: updated };
}

export async function saveConsultationDiagnosis(
  consultationId: string,
  input: SaveDiagnosisInput,
) {
  return createDiagnosis({
    consultationId,
    cie10CodeId: input.cie10CodeId,
    diagnostic_date: new Date().toISOString(),
    diagnosis_details: input.diagnosis,
  });
}
