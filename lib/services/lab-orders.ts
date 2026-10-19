import { heydoctorApi } from "../heydoctor-api";
import { withCache } from "../clinical-cache";
import { createClinicalLogger } from "../clinical-logger";
import { downloadClinicalPdf } from "../download-clinical-pdf";

const BASE = "/lab-orders";
const log = createClinicalLogger("clinical");

export interface LabExamItem {
  exam: string;
  priority?: string;
  reason?: string;
  observations?: string;
}

export interface LabOrderRecord {
  id: string;
  patientId: string;
  consultationId?: string | null;
  exams: LabExamItem[];
  createdAt?: string;
}

export interface LabTemplate {
  id: string;
  name: string;
  exams: LabExamItem[];
  isFavorite?: boolean;
}

export interface CreateLabOrderDto {
  patientId: string;
  consultationId?: string;
  exams: LabExamItem[];
  templateName?: string;
  habDecisionId?: string;
}

export interface CreateLabTemplateDto {
  name: string;
  exams: LabExamItem[];
  isFavorite?: boolean;
}

export async function fetchLabOrdersByPatient(
  patientId: string,
): Promise<LabOrderRecord[]> {
  const res = await heydoctorApi.get<{ data: LabOrderRecord[] }>(
    `${BASE}/patient/${patientId}`,
  );
  return res.data ?? [];
}

export async function fetchLabTemplates(): Promise<LabTemplate[]> {
  const res = await heydoctorApi.get<LabTemplate[] | { data: LabTemplate[] }>(
    `${BASE}/templates`,
  );
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

export async function saveLabTemplate(
  dto: CreateLabTemplateDto,
): Promise<LabTemplate> {
  return heydoctorApi.post<LabTemplate>(`${BASE}/templates`, dto);
}

export const suggestLabTests = withCache(
  async (q: string): Promise<string[]> => {
    const res = await heydoctorApi.get<{ data?: string[] }>(
      `${BASE}/suggest-tests?q=${encodeURIComponent(q)}`,
    );
    const list = res.data ?? [];
    log.debug("suggestLabTests", { q, count: list.length });
    return list;
  },
  (q: string) => `lab:${q.trim().toLowerCase()}`,
  { ttlMs: 60_000, shouldCache: (list) => list.length > 0 },
);

export async function createLabOrder(
  dto: CreateLabOrderDto,
): Promise<LabOrderRecord> {
  const res = await heydoctorApi.post<{ data: LabOrderRecord }>(BASE, dto);
  return res.data;
}

export async function downloadLabOrderPdf(id: string): Promise<void> {
  await downloadClinicalPdf(
    `${BASE}/${id}/pdf`,
    `orden-lab-${id.slice(0, 8)}.pdf`,
  );
}
