/**
 * CI-3 — Read adapter for Clinical Recommendation Engine (Facade only).
 */

import { getMedicalCopilotClinicalRecommendations } from "../api";
import { mapRecommendationsEnvelope } from "./recommendations-mapper";
import type { ClinicalRecommendationResult } from "./recommendations";

export async function getClinicalRecommendations(
  sessionId: string,
): Promise<ClinicalRecommendationResult | null> {
  const envelope = await getMedicalCopilotClinicalRecommendations(sessionId);
  return mapRecommendationsEnvelope(envelope.data ?? envelope);
}

export type ClinicalRecommendationsReadAdapter = {
  getClinicalRecommendations: typeof getClinicalRecommendations;
};

export const clinicalRecommendationsReadAdapter: ClinicalRecommendationsReadAdapter =
  {
    getClinicalRecommendations,
  };
