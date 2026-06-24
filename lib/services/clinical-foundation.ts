import { heydoctorApi } from "../heydoctor-api";
import type { ClinicalFoundationBundle } from "../types/clinical-foundation";

export async function fetchClinicalFoundationBundle(
  consultationId: string,
): Promise<ClinicalFoundationBundle> {
  const res = await heydoctorApi.get<{ data: ClinicalFoundationBundle }>(
    `/clinical-foundation/consultation/${consultationId}`,
  );
  return res.data ?? (res as unknown as ClinicalFoundationBundle);
}
