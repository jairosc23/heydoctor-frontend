import { heydoctorApi } from "../heydoctor-api";
import { withCache } from "../clinical-cache";
import { createClinicalLogger } from "../clinical-logger";
import { downloadClinicalPdf } from "../download-clinical-pdf";
import type {
  SmartMedicationSuggestion,
  SmartSuggestionsParams,
  SmartSuggestionsResult,
} from "../types/drug-catalog";

const BASE = "/prescriptions";
const log = createClinicalLogger("clinical");

export interface MedicationItem {
  name: string;
  /** Vademécum presentation UUID when selected from catalog/smart-suggestions. */
  drugPresentationId?: string;
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

function buildSmartQuery(params: SmartSuggestionsParams): string {
  const qs = new URLSearchParams();
  if (params.q?.trim()) qs.set("q", params.q.trim());
  if (params.consultationId) qs.set("consultationId", params.consultationId);
  if (params.cie10CodeId) qs.set("cie10CodeId", params.cie10CodeId);
  if (params.patientId) qs.set("patientId", params.patientId);
  if (params.countryCode) qs.set("countryCode", params.countryCode);
  if (params.limit != null) qs.set("limit", String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

/**
 * Preferred catalog-aware suggestions (Nest smart-suggestions).
 * Returns typed presentations — use instead of legacy string suggest.
 */
export async function fetchSmartMedicationSuggestions(
  params: SmartSuggestionsParams = {},
): Promise<SmartSuggestionsResult> {
  const res = await heydoctorApi.get<{ data?: SmartSuggestionsResult }>(
    `${BASE}/smart-suggestions${buildSmartQuery(params)}`,
  );
  const data = res.data;
  const empty: SmartSuggestionsResult = {
    diagnosisContext: null,
    suggested: [],
    favorites: [],
    recent: [],
    frequent: [],
    personalPatterns: [],
    warnings: [],
  };
  if (!data || typeof data !== "object") return empty;
  return {
    diagnosisContext: data.diagnosisContext ?? null,
    suggested: data.suggested ?? [],
    favorites: data.favorites ?? [],
    recent: data.recent ?? [],
    frequent: data.frequent ?? [],
    personalPatterns: data.personalPatterns ?? [],
    warnings: data.warnings ?? [],
  };
}

export const fetchSmartMedicationSuggestionsCached = withCache(
  fetchSmartMedicationSuggestions,
  (params: SmartSuggestionsParams = {}) =>
    `rx-smart:${JSON.stringify({
      q: params.q?.trim().toLowerCase() ?? "",
      consultationId: params.consultationId ?? "",
      cie10CodeId: params.cie10CodeId ?? "",
      patientId: params.patientId ?? "",
      countryCode: params.countryCode ?? "",
      limit: params.limit ?? "",
    })}`,
  {
    ttlMs: 60_000,
    shouldCache: (result) => (result.suggested?.length ?? 0) > 0,
  },
);

/**
 * @deprecated Prefer `fetchSmartMedicationSuggestions`.
 * Legacy string list kept for backward compatibility.
 */
export const suggestMedications = withCache(
  async (q: string): Promise<string[]> => {
    const result = await fetchSmartMedicationSuggestions({ q, limit: 20 });
    const list = result.suggested.map((s) => s.displayLabel);
    log.debug("suggestMedications(deprecated)", { q, count: list.length });
    return list;
  },
  (q: string) => `med:${q.trim().toLowerCase()}`,
  { ttlMs: 60_000, shouldCache: (list) => list.length > 0 },
);

/** Convenience: typed smart rows for autocomplete UIs. */
export async function suggestMedicationPresentations(
  q: string,
  opts?: Omit<SmartSuggestionsParams, "q">,
): Promise<SmartMedicationSuggestion[]> {
  const result = await fetchSmartMedicationSuggestionsCached({
    q,
    limit: opts?.limit ?? 12,
    consultationId: opts?.consultationId,
    cie10CodeId: opts?.cie10CodeId,
    patientId: opts?.patientId,
    countryCode: opts?.countryCode,
  });
  return result.suggested;
}

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
