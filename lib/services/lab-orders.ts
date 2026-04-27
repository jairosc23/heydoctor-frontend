import { heydoctorApi } from "../heydoctor-api";
import { withCache } from "../clinical-cache";
import { createClinicalLogger } from "../clinical-logger";

const BASE = "/lab-orders";
const log = createClinicalLogger("clinical");

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
  const res = await heydoctorApi.getOrFallback<{ data: unknown[] }>(
    `${BASE}/patient/${patientId}`,
    { data: [] }
  );
  return res.data ?? [];
}

/**
 * Sugerencias de exámenes (laboratorio/imagen) por substring. Cache 60 s.
 */
export const suggestLabTests = withCache(
  async (q: string): Promise<string[]> => {
    const res = await heydoctorApi.getOrFallback<{ data?: string[] }>(
      `${BASE}/suggest-tests?q=${encodeURIComponent(q)}`,
      { data: [] }
    );
    const list = res.data ?? [];
    log.debug("suggestLabTests", { q, count: list.length });
    return list;
  },
  (q: string) => `lab:${q.trim().toLowerCase()}`,
  { ttlMs: 60_000, shouldCache: (list) => list.length > 0 }
);

export async function createLabOrder(dto: CreateLabOrderDto) {
  return heydoctorApi.postOrFallback<{ data: unknown }>(BASE, dto, { data: null });
}
