import { apiGet } from "../api-client";

const BASE = "/patients";

export interface PatientFilters {
  search?: string;
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

function unwrapList(raw: unknown): PatientRow[] {
  if (Array.isArray(raw)) {
    return raw.map((x) => normalizePatient(x as Record<string, unknown>));
  }
  const wrapped = raw as { data?: unknown[] };
  if (Array.isArray(wrapped?.data)) {
    return wrapped.data.map((x) =>
      normalizePatient(x as Record<string, unknown>)
    );
  }
  return [];
}

export async function fetchPatients(filters?: PatientFilters): Promise<{
  data: PatientRow[];
  total: number;
}> {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.limit != null) params.set("limit", String(filters.limit));
  if (filters?.offset != null) params.set("offset", String(filters.offset));
  const q = params.toString() ? `?${params}` : "";
  const raw = await apiGet<unknown>(`${BASE}${q}`);
  const data = unwrapList(raw);
  return { data, total: data.length };
}

