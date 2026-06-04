import { heydoctorApi } from "../heydoctor-api";
import { withCache } from "../clinical-cache";
import { createClinicalLogger } from "../clinical-logger";
import { downloadClinicalPdf } from "../download-clinical-pdf";

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

export interface PrescriptionRecord {
  id: string;
  patientId: string;
  consultationId?: string | null;
  diagnosis?: string | null;
  medications: MedicationItem[];
  notes?: string | null;
  validationCode?: string;
  status?: string;
  createdAt?: string;
}

export interface CreatePrescriptionDto {
  patientId: string;
  consultationId?: string;
  diagnosis?: string;
  medications: MedicationItem[];
  notes?: string;
}

export interface UpdatePrescriptionDto {
  diagnosis?: string;
  medications?: MedicationItem[];
  notes?: string;
}

export async function fetchPrescriptionsByPatient(
  patientId: string,
): Promise<PrescriptionRecord[]> {
  const res = await heydoctorApi.get<{ data: PrescriptionRecord[] }>(
    `${BASE}/patient/${patientId}`,
  );
  return res.data ?? [];
}

export const suggestMedications = withCache(
  async (q: string): Promise<string[]> => {
    const res = await heydoctorApi.get<{ data?: string[] }>(
      `${BASE}/suggest-medications?q=${encodeURIComponent(q)}`,
    );
    const list = res.data ?? [];
    log.debug("suggestMedications", { q, count: list.length });
    return list;
  },
  (q: string) => `med:${q.trim().toLowerCase()}`,
  { ttlMs: 60_000, shouldCache: (list) => list.length > 0 },
);

export async function createPrescription(
  dto: CreatePrescriptionDto,
): Promise<PrescriptionRecord> {
  const res = await heydoctorApi.post<{ data: PrescriptionRecord }>(BASE, dto);
  return res.data;
}

export async function updatePrescription(
  id: string,
  dto: UpdatePrescriptionDto,
): Promise<PrescriptionRecord> {
  const res = await heydoctorApi.patch<{ data: PrescriptionRecord }>(
    `${BASE}/${id}`,
    dto,
  );
  return res.data;
}

export async function deletePrescription(id: string): Promise<void> {
  await heydoctorApi.delete(`${BASE}/${id}`);
}

export async function downloadPrescriptionPdf(id: string): Promise<void> {
  await downloadClinicalPdf(`${BASE}/${id}/pdf`, `receta-${id.slice(0, 8)}.pdf`);
}
