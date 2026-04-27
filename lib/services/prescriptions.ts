import { heydoctorApi } from "../heydoctor-api";
import { withCache } from "../clinical-cache";
import { createClinicalLogger } from "../clinical-logger";

const BASE = "/prescriptions";
const log = createClinicalLogger("clinical");

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

/**
 * Sugerencias de medicamentos por substring. Cacheado 60 s para no martillear
 * el backend en cada keystroke. Solo se cachean respuestas con resultados;
 * si la API devuelve vacío, dejamos que el componente caiga al fallback demo.
 */
export const suggestMedications = withCache(
  async (q: string): Promise<string[]> => {
    const res = await heydoctorApi.getOrFallback<{ data?: string[] }>(
      `${BASE}/suggest-medications?q=${encodeURIComponent(q)}`,
      { data: [] }
    );
    const list = res.data ?? [];
    log.debug("suggestMedications", { q, count: list.length });
    return list;
  },
  (q: string) => `med:${q.trim().toLowerCase()}`,
  { ttlMs: 60_000, shouldCache: (list) => list.length > 0 }
);

export async function createPrescription(dto: CreatePrescriptionDto) {
  return heydoctorApi.postOrFallback<{ data: unknown }>(BASE, dto, { data: null });
}
