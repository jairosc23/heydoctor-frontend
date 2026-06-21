import { heydoctorApi } from "./heydoctor-api";
import type { ClinicalFoundationBundle } from "./types/clinical-foundation.types";

export async function fetchClinicalFoundation(
  consultationId: string,
): Promise<ClinicalFoundationBundle> {
  const res = await heydoctorApi.get<
    ClinicalFoundationBundle | { data: ClinicalFoundationBundle }
  >(`/clinical-foundation/consultation/${consultationId}`);
  return "data" in res ? res.data : res;
}
