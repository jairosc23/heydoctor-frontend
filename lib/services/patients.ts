import { apiGet, apiPost } from "../api-client";

const BASE = "/patients";

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

export interface PatientFilters {
  search?: string;
  page?: number;
  limit?: number;
  offset?: number;
}

/** Fila de paciente unificada para la UI (Nest usa `name`; legacy usaba firstname/lastname). */
export interface PatientRow {
  id: string;
  firstname?: string;
  lastname?: string;
  name?: string;
  email?: string;
  identification?: string;
  /** Si el backend los expone más adelante */
  age?: string | number;
  sex?: string;
  gender?: string;
}

function normalizePatient(p: Record<string, unknown>): PatientRow {
  const id = String(p.id ?? "");
  const name = typeof p.name === "string" ? p.name : "";
  const parts = name.trim().split(/\s+/);
  const firstname =
    typeof p.firstname === "string"
      ? p.firstname
      : parts[0] ?? "";
  const lastname =
    typeof p.lastname === "string"
      ? p.lastname
      : parts.slice(1).join(" ") || undefined;
  return {
    id,
    firstname,
    lastname,
    name: name || undefined,
    email: typeof p.email === "string" ? p.email : undefined,
    identification:
      typeof p.identification === "string" ? p.identification : undefined,
    age: p.age !== undefined && p.age !== null ? String(p.age) : undefined,
    sex: typeof p.sex === "string" ? p.sex : undefined,
    gender: typeof p.gender === "string" ? p.gender : undefined,
  };
}

function unwrapListWithTotal(raw: unknown): {
  data: PatientRow[];
  total: number;
} {
  if (Array.isArray(raw)) {
    const data = raw.map((x) =>
      normalizePatient(x as Record<string, unknown>)
    );
    return { data, total: data.length };
  }
  const wrapped = raw as { data?: unknown[]; total?: number };
  if (Array.isArray(wrapped?.data)) {
    const data = wrapped.data.map((x) =>
      normalizePatient(x as Record<string, unknown>)
    );
    const total =
      typeof wrapped.total === "number" ? wrapped.total : data.length;
    return { data, total };
  }
  return { data: [], total: 0 };
}

export async function fetchPatients(filters?: PatientFilters): Promise<{
  data: PatientRow[];
  total: number;
}> {
  const params = new URLSearchParams();
  appendQueryParam(params, "search", filters?.search);
  appendQueryParam(params, "page", filters?.page);
  appendQueryParam(params, "limit", filters?.limit);
  appendQueryParam(params, "offset", filters?.offset);
  const q = params.toString() ? `?${params}` : "";
  const raw = await apiGet<unknown>(`${BASE}${q}`);
  return unwrapListWithTotal(raw);
}

export interface CreatePatientDto {
  name: string;
  email: string;
}

export async function createPatient(dto: CreatePatientDto): Promise<PatientRow> {
  const raw = await apiPost<Record<string, unknown>>(BASE, dto);
  return normalizePatient(raw);
}

