import { heydoctorApi } from "../heydoctor-api";

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
  const res = await heydoctorApi.post<{ data: unknown }>(BASE, dto);
  return res;
}
