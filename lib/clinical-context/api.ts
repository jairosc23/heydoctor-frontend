import { heydoctorApi } from "../heydoctor-api";
import type {
  ClinicalContextBindingRecord,
  ClinicalContextStatusResponse,
} from "./types";

const BASE = "/clinical-context";

export async function bindClinicalContext(
  consultationId: string,
): Promise<ClinicalContextBindingRecord> {
  const res = await heydoctorApi.post<{ data: ClinicalContextBindingRecord }>(
    `${BASE}/consultations/${encodeURIComponent(consultationId)}/bind`,
    {},
  );
  return res.data;
}

export async function getClinicalContextStatus(
  consultationId: string,
): Promise<ClinicalContextStatusResponse> {
  const res = await heydoctorApi.get<{ data: ClinicalContextStatusResponse }>(
    `${BASE}/consultations/${encodeURIComponent(consultationId)}`,
  );
  return res.data;
}

export async function validateClinicalContext(
  consultationId: string,
): Promise<ClinicalContextBindingRecord> {
  const res = await heydoctorApi.post<{ data: ClinicalContextBindingRecord }>(
    `${BASE}/consultations/${encodeURIComponent(consultationId)}/validate`,
    {},
  );
  return res.data;
}
