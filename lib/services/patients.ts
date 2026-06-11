import { heydoctorApi } from "../heydoctor-api";

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

export type PatientDocumentType =
  | "RUT"
  | "DNI"
  | "CPF"
  | "SSN"
  | "PASSPORT"
  | "NIE"
  | "OTHER";

export type PatientSex = "male" | "female" | "other" | "unknown";

export type PatientStatus = "active" | "inactive" | "deceased";

export interface PatientFilters {
  search?: string;
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PatientProfile {
  id?: string;
  patientId?: string;
  chronicConditions?: Record<string, unknown>[];
  surgeries?: Record<string, unknown>[];
  allergies?: Record<string, unknown>[];
  medications?: Record<string, unknown>[];
  disabilities?: Record<string, unknown>[];
  familyHistory?: Record<string, unknown>[];
  smokingStatus?: string | null;
  alcoholUse?: string | null;
  drugUse?: string | null;
  exerciseFrequency?: string | null;
  alerts?: Record<string, unknown>[];
  clinicalWarnings?: Record<string, unknown>[];
  immunizations?: Record<string, unknown>[];
  notes?: string | null;
  updatedAt?: string;
}

/** Fila de paciente unificada para la UI (Nest usa `name`; legacy usaba firstname/lastname). */
export interface PatientRow {
  id: string;
  firstname?: string;
  lastname?: string;
  name?: string;
  displayName?: string;
  email?: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  secondLastName?: string | null;
  preferredName?: string | null;
  documentType?: PatientDocumentType | null;
  documentNumber?: string | null;
  identification?: string;
  age?: string | number | null;
  birthDate?: string | null;
  sex?: PatientSex | string | null;
  gender?: string;
  genderIdentity?: string | null;
  nationality?: string | null;
  phone?: string | null;
  mobilePhone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  stateProvince?: string | null;
  postalCode?: string | null;
  country?: string | null;
  insuranceProvider?: string | null;
  insurancePlan?: string | null;
  memberNumber?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyRelationship?: string | null;
  status?: PatientStatus | string | null;
  profile?: PatientProfile | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdatePatientDto {
  name?: string;
  email?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  secondLastName?: string;
  preferredName?: string;
  documentType?: PatientDocumentType;
  documentNumber?: string;
  sex?: PatientSex;
  genderIdentity?: string;
  birthDate?: string | null;
  nationality?: string;
  phone?: string;
  mobilePhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  insuranceProvider?: string;
  insurancePlan?: string;
  memberNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyRelationship?: string;
  status?: PatientStatus;
}

export type UpsertPatientProfileDto = Partial<PatientProfile>;

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNullableString(value: unknown): string | null | undefined {
  if (value === null) return null;
  return typeof value === "string" ? value : undefined;
}

export function normalizePatient(p: Record<string, unknown>): PatientRow {
  const id = String(p.id ?? "");
  const name = asString(p.name) ?? "";
  const displayName =
    (asString(p.displayName) ?? name) ||
    [asString(p.firstName), asString(p.lastName)].filter(Boolean).join(" ");
  const parts = name.trim().split(/\s+/);
  const firstname =
    asString(p.firstname) ?? asString(p.firstName) ?? parts[0] ?? "";
  const lastname =
    (asString(p.lastname) ??
      asString(p.lastName) ??
      parts.slice(1).join(" ")) ||
    undefined;
  const documentNumber = asNullableString(p.documentNumber);
  const documentType = asString(p.documentType) as
    | PatientDocumentType
    | undefined;

  return {
    id,
    firstname,
    lastname,
    name: name || undefined,
    displayName: displayName || undefined,
    email: asString(p.email),
    firstName: (asNullableString(p.firstName) ?? firstname) || null,
    middleName: asNullableString(p.middleName),
    lastName: (asNullableString(p.lastName) ?? lastname) || null,
    secondLastName: asNullableString(p.secondLastName),
    preferredName: asNullableString(p.preferredName),
    documentType: documentType ?? null,
    documentNumber,
    identification:
      documentNumber ??
      asString(p.identification) ??
      (documentType && documentNumber
        ? `${documentType} ${documentNumber}`
        : undefined),
    age:
      p.age !== undefined && p.age !== null && p.age !== ""
        ? (p.age as string | number)
        : null,
    birthDate: asNullableString(p.birthDate),
    sex: (asString(p.sex) as PatientSex | undefined) ?? null,
    gender: asString(p.gender),
    genderIdentity: asNullableString(p.genderIdentity),
    nationality: asNullableString(p.nationality),
    phone: asNullableString(p.phone),
    mobilePhone: asNullableString(p.mobilePhone),
    addressLine1: asNullableString(p.addressLine1),
    addressLine2: asNullableString(p.addressLine2),
    city: asNullableString(p.city),
    stateProvince: asNullableString(p.stateProvince),
    postalCode: asNullableString(p.postalCode),
    country: asNullableString(p.country),
    insuranceProvider: asNullableString(p.insuranceProvider),
    insurancePlan: asNullableString(p.insurancePlan),
    memberNumber: asNullableString(p.memberNumber),
    emergencyContactName: asNullableString(p.emergencyContactName),
    emergencyContactPhone: asNullableString(p.emergencyContactPhone),
    emergencyRelationship: asNullableString(p.emergencyRelationship),
    status: (asString(p.status) as PatientStatus | undefined) ?? null,
    profile:
      p.profile && typeof p.profile === "object"
        ? (p.profile as PatientProfile)
        : null,
    createdAt: asString(p.createdAt),
    updatedAt: asString(p.updatedAt),
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
  const raw = await heydoctorApi.get<unknown>(`${BASE}${q}`);
  return unwrapListWithTotal(raw);
}

export async function fetchPatientById(id: string): Promise<PatientRow> {
  const raw = await heydoctorApi.get<Record<string, unknown>>(`${BASE}/${id}`);
  return normalizePatient(raw);
}

export async function fetchPatientProfile(id: string): Promise<PatientProfile> {
  const raw = await heydoctorApi.get<Record<string, unknown>>(
    `${BASE}/${id}/profile`
  );
  return raw as PatientProfile;
}

export async function updatePatient(
  id: string,
  dto: UpdatePatientDto
): Promise<PatientRow> {
  const raw = await heydoctorApi.patch<Record<string, unknown>>(
    `${BASE}/${id}`,
    dto
  );
  return normalizePatient(raw);
}

export async function upsertPatientProfile(
  id: string,
  dto: UpsertPatientProfileDto
): Promise<PatientProfile> {
  const raw = await heydoctorApi.fetch<Record<string, unknown>>(
    `${BASE}/${id}/profile`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    }
  );
  return raw as PatientProfile;
}

export interface CreatePatientDto {
  name?: string;
  email: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  secondLastName?: string;
  preferredName?: string;
  documentType?: PatientDocumentType;
  documentNumber?: string;
  sex?: PatientSex;
  genderIdentity?: string;
  birthDate?: string;
  nationality?: string;
  phone?: string;
  mobilePhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  insuranceProvider?: string;
  insurancePlan?: string;
  memberNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyRelationship?: string;
  status?: PatientStatus;
}

export async function createPatient(dto: CreatePatientDto): Promise<PatientRow> {
  const raw = await heydoctorApi.post<Record<string, unknown>>(BASE, dto);
  return normalizePatient(raw);
}

export function formatPatientDisplayName(p: PatientRow): string {
  return (
    p.displayName?.trim() ||
    p.name?.trim() ||
    [p.firstName ?? p.firstname, p.lastName ?? p.lastname]
      .filter(Boolean)
      .join(" ") ||
    "Paciente"
  );
}

export function formatPatientAge(age: PatientRow["age"]): string {
  if (age === null || age === undefined || age === "") return "—";
  return `${age} años`;
}
