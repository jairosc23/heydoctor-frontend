import { apiGetOrFallback } from "../api-client";

export async function searchMedical(
  q: string,
  type: "patient" | "doctor" | "diagnostic" = "diagnostic"
) {
  return apiGetOrFallback<{
    data?: { patients?: unknown[]; doctors?: unknown[]; diagnostics?: unknown[] };
  }>(
    `/search?q=${encodeURIComponent(q)}&type=${type}`,
    { data: { patients: [], doctors: [], diagnostics: [] } }
  );
}
