import { heydoctorApi } from "../heydoctor-api";

export async function searchMedical(
  q: string,
  type: "patient" | "doctor" | "diagnostic" = "diagnostic"
) {
  return heydoctorApi.getOrFallback<{
    data?: { patients?: unknown[]; doctors?: unknown[]; diagnostics?: unknown[] };
  }>(
    `/search?q=${encodeURIComponent(q)}&type=${type}`,
    { data: { patients: [], doctors: [], diagnostics: [] } }
  );
}
