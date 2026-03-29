import { apiGet, apiPatch, apiPost } from "../api-client";

const BASE = "/consultations";

/** Crear consulta en Nest: solo patientId + reason. */
export interface CreateConsultationDto {
  patientId: string;
  reason: string;
}

export interface ConsultationFilters {
  patientId?: string;
  doctorId?: string;
  clinicId?: string;
  status?: string;
  from?: string;
  to?: string;
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
  reason?: string;
  diagnosis?: string | null;
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

function unwrapList(raw: unknown): NestConsultation[] {
  if (Array.isArray(raw)) {
    return raw as NestConsultation[];
  }
  const w = raw as { data?: NestConsultation[] };
  return Array.isArray(w?.data) ? w.data : [];
}

export async function fetchConsultations(
  filters?: ConsultationFilters
): Promise<{ data: NestConsultation[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.patientId) params.set("patientId", filters.patientId);
  if (filters?.doctorId) params.set("doctorId", filters.doctorId);
  if (filters?.clinicId) params.set("clinicId", filters.clinicId);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.from) params.set("from", filters.from);
  if (filters?.to) params.set("to", filters.to);
  if (filters?.limit != null) params.set("limit", String(filters.limit));
  if (filters?.offset != null) params.set("offset", String(filters.offset));
  const q = params.toString() ? `?${params}` : "";
  const raw = await apiGet<unknown>(`${BASE}${q}`);
  const data = unwrapList(raw);
  return { data, total: data.length };
}

export async function fetchConsultation(id: string): Promise<NestConsultation> {
  const raw = await apiGet<NestConsultation | { data: NestConsultation }>(
    `${BASE}/${id}`
  );
  const w = raw as { data?: NestConsultation };
  return w.data ?? (raw as NestConsultation);
}

export async function createConsultation(dto: CreateConsultationDto) {
  return apiPost<NestConsultation>(BASE, dto);
}

/** Respuesta de GET /consultations/:id/ai */
export interface ConsultationAiPayload {
  summary: string | null;
  suggestedDiagnosis: string[] | null;
  improvedNotes: string | null;
  generatedAt: string | null;
}

export interface UpdateConsultationDto {
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  status?: string;
}

export async function updateConsultation(
  id: string,
  dto: UpdateConsultationDto
): Promise<NestConsultation> {
  return apiPatch<NestConsultation>(`${BASE}/${id}`, dto);
}

export async function signConsultation(
  id: string,
  signature: string
): Promise<NestConsultation> {
  return apiPost<NestConsultation>(`${BASE}/${id}/sign`, { signature });
}

export async function startCall(
  id: string
): Promise<{ ok: boolean; consultationId: string }> {
  return apiPost<{ ok: boolean; consultationId: string }>(
    `${BASE}/${id}/start-call`,
    {}
  );
}

export async function fetchConsultationAi(
  consultationId: string
): Promise<ConsultationAiPayload> {
  return apiGet<ConsultationAiPayload>(`${BASE}/${consultationId}/ai`);
}
