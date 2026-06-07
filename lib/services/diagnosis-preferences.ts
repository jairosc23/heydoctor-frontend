import { heydoctorApi } from "../heydoctor-api";

export type DiagnosisSuggestionSource =
  | "favorite"
  | "recent"
  | "frequent"
  | "search";

export interface DiagnosisSuggestion {
  id: string;
  code: string;
  description: string;
  source: DiagnosisSuggestionSource;
  isFavorite: boolean;
  sortOrder?: number;
  useCount?: number;
  lastUsedAt?: string;
  labelOverride?: string | null;
}

export interface DiagnosisSuggestionsPayload {
  favorites: DiagnosisSuggestion[];
  recent: DiagnosisSuggestion[];
  frequent: DiagnosisSuggestion[];
}

export async function fetchDiagnosisSuggestions(
  q?: string,
): Promise<DiagnosisSuggestionsPayload> {
  const params = new URLSearchParams();
  if (q?.trim()) {
    params.set("q", q.trim());
  }
  const suffix = params.toString() ? `?${params}` : "";
  const res = await heydoctorApi.get<{ data: DiagnosisSuggestionsPayload }>(
    `/clinical-preferences/diagnosis-suggestions${suffix}`,
  );
  return (
    res?.data ?? {
      favorites: [],
      recent: [],
      frequent: [],
    }
  );
}

export async function toggleFavoriteDiagnosis(cie10CodeId: string): Promise<{
  isFavorite: boolean;
  favoriteId: string | null;
}> {
  const res = await heydoctorApi.post<{
    data: { isFavorite: boolean; favoriteId: string | null };
  }>("/clinical-preferences/favorite-diagnoses/toggle", { cie10CodeId });
  return res.data;
}
