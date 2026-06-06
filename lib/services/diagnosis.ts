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
  const updated = await updateConsultation(consultationId, { diagnosis });
  return { data: updated };
}
