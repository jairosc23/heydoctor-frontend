import { apiGetOrFallback, apiPostOrFallback } from "../api-client";

const BASE = "/lab-orders";

export interface CreateLabOrderDto {
  patientId: string;
  consultationId?: string;
  diagnosisId?: string;
  lab_tests: string[];
  status?: string;
  priority?: string;
  diagnosis_code?: string;
  notes?: string;
}

export async function fetchLabOrdersByPatient(patientId: string) {
  const res = await apiGetOrFallback<{ data: unknown[] }>(
    `${BASE}/patient/${patientId}`,
    { data: [] }
  );
  return res.data ?? [];
}

export async function suggestLabTests(q: string) {
  const res = await apiGetOrFallback<{ data?: string[] }>(
    `${BASE}/suggest-tests?q=${encodeURIComponent(q)}`,
    { data: [] }
  );
  return res.data ?? [];
}

export async function createLabOrder(dto: CreateLabOrderDto) {
  return apiPostOrFallback<{ data: unknown }>(BASE, dto, { data: null });
}
