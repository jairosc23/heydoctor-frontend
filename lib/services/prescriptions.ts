import { apiGetOrFallback, apiPostOrFallback } from "../api-client";

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
  const res = await apiGetOrFallback<{ data: unknown[] }>(
    `${BASE}/patient/${patientId}`,
    { data: [] }
  );
  return res.data ?? [];
}

export async function suggestMedications(q: string) {
  const res = await apiGetOrFallback<{ data?: string[] }>(
    `${BASE}/suggest-medications?q=${encodeURIComponent(q)}`,
    { data: [] }
  );
  return res.data ?? [];
}

export async function createPrescription(dto: CreatePrescriptionDto) {
  return apiPostOrFallback<{ data: unknown }>(BASE, dto, { data: null });
}
