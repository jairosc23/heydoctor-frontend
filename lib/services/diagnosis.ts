import { apiPost } from "../api-client";

const BASE = "/diagnosis";

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

export async function createDiagnosis(dto: CreateDiagnosisDto) {
  const res = await apiPost<{ data: unknown }>(BASE, dto);
  return res;
}
