import { heydoctorApi } from "../heydoctor-api";
import type { ClinicalFlowSuggestionsResponse } from "../types/clinical-intelligence-flow";

export type ClinicalFlowSuggestionsParams = {
  cie10CodeId?: string;
  cie10Code?: string;
  countryCode?: string;
  medicationLimit?: number;
  labLimit?: number;
  educationLimit?: number;
  followUpLimit?: number;
};

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchClinicalFlowSuggestions(
  params: ClinicalFlowSuggestionsParams = {},
): Promise<ClinicalFlowSuggestionsResponse> {
  const qs = buildQuery({
    cie10CodeId: params.cie10CodeId,
    cie10Code: params.cie10Code,
    countryCode: params.countryCode ?? "CL",
    medicationLimit: params.medicationLimit,
    labLimit: params.labLimit,
    educationLimit: params.educationLimit,
    followUpLimit: params.followUpLimit,
  });
  const res = await heydoctorApi.get<{ data: ClinicalFlowSuggestionsResponse }>(
    `/clinical-catalog/flow/suggestions${qs}`,
  );
  return res.data ?? (res as unknown as ClinicalFlowSuggestionsResponse);
}
