import { heydoctorApi } from "../heydoctor-api";

const BASE = "/prescriptions";

export interface MedicationItem {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  route?: string;
  instructions?: string;
}

export interface CreatePrescriptionDto {
  patientId: string;
  consultationId?: string;
  diagnosisId?: string;
  medications: MedicationItem[];
  dosage?: string;
  instructions?: string;
  notes?: string;
}

export async function fetchPrescriptionsByPatient(patientId: string) {
  const res = await heydoctorApi.getOrFallback<{ data: unknown[] }>(
    `${BASE}/patient/${patientId}`,
    { data: [] }
  );
  return res.data ?? [];
}

export async function suggestMedications(q: string) {
  const res = await heydoctorApi.getOrFallback<{ data?: string[] }>(
    `${BASE}/suggest-medications?q=${encodeURIComponent(q)}`,
    { data: [] }
  );
  return res.data ?? [];
}

export async function createPrescription(dto: CreatePrescriptionDto) {
  return heydoctorApi.postOrFallback<{ data: unknown }>(BASE, dto, { data: null });
}
