/**
 * CI-2 — Read adapter for Clinical Insight Engine (Facade only).
 */

import { getMedicalCopilotClinicalInsights } from "../api";
import { mapInsightsEnvelope } from "./insights-mapper";
import type { ClinicalInsightResult } from "./insights";

export async function getClinicalInsights(
  sessionId: string,
): Promise<ClinicalInsightResult | null> {
  const envelope = await getMedicalCopilotClinicalInsights(sessionId);
  return mapInsightsEnvelope(envelope.data ?? envelope);
}

export type ClinicalInsightsReadAdapter = {
  getClinicalInsights: typeof getClinicalInsights;
};

export const clinicalInsightsReadAdapter: ClinicalInsightsReadAdapter = {
  getClinicalInsights,
};
