import { apiGetOrFallback, apiPostOrFallback } from "../api-client";

const BASE = "/ai-insights";

export interface GenerateInsightsDto {
  patientId: string;
  consultationId?: string;
  symptoms?: string;
  symptomsList?: string[];
  context?: string;
}

export async function fetchAiInsightsByPatient(
  patientId: string,
  limit = 10
) {
  const res = await apiGetOrFallback<{ data?: unknown[] }>(
    `${BASE}/patient/${patientId}?limit=${limit}`,
    { data: [] }
  );
  return res.data ?? [];
}

export async function generateAiInsights(dto: GenerateInsightsDto) {
  return apiPostOrFallback<{ data?: unknown }>(
    `${BASE}/generate`,
    dto,
    { data: null }
  );
}
