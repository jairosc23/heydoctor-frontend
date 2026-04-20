import { heydoctorApi } from "../heydoctor-api";

const BASE = "/consultations";

function appendQueryParam(
  params: URLSearchParams,
  key: string,
  value: string | number | undefined | null
): void {
  if (value === undefined || value === null) return;
  const s = typeof value === "number" ? String(value) : value.trim();
  if (s === "") return;
  params.set(key, s);
}

/** Crear consulta en Nest: `patientId` + `reason` (chiefComplaint se mapea a reason en wire). */
export interface CreateConsultationDto {
  patientId: string;
  chiefComplaint?: string;
  reason?: string;
}

export interface ConsultationFilters {
  patientId?: string;
  doctorId?: string;
  status?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
  offset?: number;
}

export interface NestPatientRef {
  id?: string;
  name?: string;
  email?: string;
}

export interface NestConsultation {
  id: string;
  patientId?: string;
  clinicId?: string;
  doctorId?: string;
  chiefComplaint?: string | null;
  /** @deprecated backend usa chiefComplaint */
  reason?: string;
  diagnosis?: string | null;
  treatmentPlan?: string | null;
  /** @deprecated backend usa treatmentPlan */
  treatment?: string | null;
  notes?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  /** Snapshot legal al crear la consulta (solo lectura en UI). */
  consentVersion?: string | null;
  consentGivenAt?: string | null;
  doctorSignature?: string | null;
  signedAt?: string | null;
  patient?: NestPatientRef;
}

function unwrapListWithTotal(raw: unknown): {
  data: NestConsultation[];
  total: number;
} {
  if (Array.isArray(raw)) {
    const data = raw as NestConsultation[];
    return { data, total: data.length };
  }
  const w = raw as { data?: NestConsultation[]; total?: number };
  if (Array.isArray(w?.data)) {
    const total =
      typeof w.total === "number" ? w.total : w.data.length;
    return { data: w.data, total };
  }
  return { data: [], total: 0 };
}

export async function fetchConsultations(
  filters?: ConsultationFilters
): Promise<{ data: NestConsultation[]; total: number }> {
  const params = new URLSearchParams();
  appendQueryParam(params, "patientId", filters?.patientId);
  appendQueryParam(params, "doctorId", filters?.doctorId);
  appendQueryParam(params, "status", filters?.status);
  appendQueryParam(params, "from", filters?.from);
  appendQueryParam(params, "to", filters?.to);
  appendQueryParam(params, "search", filters?.search);
  appendQueryParam(params, "page", filters?.page);
  appendQueryParam(params, "limit", filters?.limit);
  appendQueryParam(params, "offset", filters?.offset);
  const q = params.toString() ? `?${params}` : "";
  const raw = await heydoctorApi.get<unknown>(`${BASE}${q}`);
  return unwrapListWithTotal(raw);
}

export async function fetchConsultation(id: string): Promise<NestConsultation> {
  const raw = await heydoctorApi.get<NestConsultation | { data: NestConsultation }>(
    `${BASE}/${id}`
  );
  const w = raw as { data?: NestConsultation };
  return w.data ?? (raw as NestConsultation);
}

export async function createConsultation(dto: CreateConsultationDto) {
  const reason = (
    dto.chiefComplaint?.trim() ||
    dto.reason?.trim() ||
    "Consulta HeyDoctor"
  ).trim();
  const patientId = dto.patientId?.trim() ?? "";
  if (!patientId) {
    throw new Error("patientId is required");
  }
  /** Contrato Nest CreateConsultationDto: solo `patientId` + `reason` (sin chiefComplaint ni otros campos). */
  const body = { patientId, reason };
  // eslint-disable-next-line no-console -- debug temporal creación consulta
  console.log("[HeyDoctor] POST /api/consultations payload", body);
  return heydoctorApi.post<NestConsultation>(BASE, body);
}

/** Respuesta de GET /consultations/:id/ai */
export interface ConsultationAiPayload {
  summary: string | null;
  suggestedDiagnosis: string[] | null;
  improvedNotes: string | null;
  generatedAt: string | null;
}

export interface UpdateConsultationDto {
  chiefComplaint?: string;
  symptoms?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  /** @deprecated usar treatmentPlan */
  treatment?: string;
  notes?: string;
  status?: string;
}

export async function updateConsultation(
  id: string,
  dto: UpdateConsultationDto
): Promise<NestConsultation> {
  const body: Record<string, unknown> = {};
  if (dto.chiefComplaint !== undefined) body.chiefComplaint = dto.chiefComplaint;
  if (dto.symptoms !== undefined) body.symptoms = dto.symptoms;
  if (dto.diagnosis !== undefined) body.diagnosis = dto.diagnosis;
  if (dto.notes !== undefined) body.notes = dto.notes;
  if (dto.status !== undefined) body.status = dto.status;
  const plan = dto.treatmentPlan ?? dto.treatment;
  if (plan !== undefined) body.treatmentPlan = plan;
  return heydoctorApi.patch<NestConsultation>(`${BASE}/${id}`, body);
}

export async function signConsultation(
  id: string,
  signature: string
): Promise<NestConsultation> {
  return heydoctorApi.post<NestConsultation>(`${BASE}/${id}/sign`, { signature });
}

export async function startCall(
  id: string
): Promise<{ ok: boolean; consultationId: string }> {
  return heydoctorApi.post<{ ok: boolean; consultationId: string }>(
    `${BASE}/${id}/start-call`,
    {}
  );
}

export async function fetchConsultationAi(
  consultationId: string
): Promise<ConsultationAiPayload> {
  return heydoctorApi.get<ConsultationAiPayload>(`${BASE}/${consultationId}/ai`);
}
