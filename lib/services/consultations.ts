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

/**
 * Query `status` en el Nest debe ir en MAYÚSCULAS con guión bajo (p. ej. IN_PROGRESS, COMPLETED).
 * Acepta entradas legacy en minúsculas (`in_progress`, `completed`, `pending`).
 */
export function normalizeConsultationStatusQueryParam(status: string): string {
  const t = status.trim().replace(/-/g, "_");
  if (!t) return t;
  return t.toUpperCase();
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

export interface NestCie10CodeRef {
  id: string;
  code: string;
  descriptionEs: string;
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
  cie10CodeId?: string | null;
  cie10Code?: NestCie10CodeRef | null;
  treatmentPlan?: string | null;
  /** @deprecated backend usa treatmentPlan */
  treatment?: string | null;
  notes?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  /** Token para enlace de invitado a teleconsulta (si el backend lo expone). */
  publicToken?: string | null;
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
  if (filters?.status != null && String(filters.status).trim() !== "") {
    appendQueryParam(
      params,
      "status",
      normalizeConsultationStatusQueryParam(String(filters.status)),
    );
  }
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
  aiRunId?: string | null;
  approvalState?: string | null;
}

export interface UpdateConsultationDto {
  chiefComplaint?: string;
  /** Wire alias for backend `reason`. */
  reason?: string;
  symptoms?: string;
  diagnosis?: string;
  cie10CodeId?: string | null;
  treatmentPlan?: string;
  /** @deprecated usar treatmentPlan */
  treatment?: string;
  notes?: string;
  status?: string;
}

/** Maps legacy frontend fields to NestJS UpdateConsultationDto. */
export function buildUpdateConsultationBody(
  dto: UpdateConsultationDto,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  const reason = dto.chiefComplaint ?? dto.reason;
  if (reason !== undefined) body.reason = reason;
  if (dto.diagnosis !== undefined) body.diagnosis = dto.diagnosis;
  if (dto.cie10CodeId !== undefined) body.cie10CodeId = dto.cie10CodeId;
  if (dto.notes !== undefined) body.notes = dto.notes;
  if (dto.status !== undefined) body.status = dto.status;
  const treatment = dto.treatment ?? dto.treatmentPlan;
  if (treatment !== undefined) body.treatment = treatment;
  return body;
}

export async function updateConsultation(
  id: string,
  dto: UpdateConsultationDto
): Promise<NestConsultation> {
  return heydoctorApi.patch<NestConsultation>(
    `${BASE}/${id}`,
    buildUpdateConsultationBody(dto),
  );
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
  const response = await heydoctorApi.post<{
    ok: boolean;
    consultationId: string;
  }>(`${BASE}/${id}/start-call`, {});
  console.log("[heydoctor] API startCall response", response);
  return response;
}

export async function fetchConsultationAi(
  consultationId: string
): Promise<ConsultationAiPayload> {
  return heydoctorApi.get<ConsultationAiPayload>(`${BASE}/${consultationId}/ai`);
}
