import { apiPostOrFallback } from "../api-client";

export async function evaluateCdss(
  symptoms: string[],
  context?: Record<string, unknown>
) {
  return apiPostOrFallback<{
    suggested_diagnoses?: Array<{
      code?: string;
      description?: string;
      confidence?: number;
    }>;
    treatment_recommendations?: unknown[];
    preventive_actions?: unknown[];
  }>(
    "/cdss/evaluate",
    { symptoms, context: context ?? {} },
    { suggested_diagnoses: [], treatment_recommendations: [], preventive_actions: [] }
  );
}
