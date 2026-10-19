/**
 * CI-1 — Read adapter for Clinical Intelligence Engine (Facade only).
 */

import { getMedicalCopilotClinicalIntelligence } from "../api";
import { mapIntelligenceEnvelope } from "./findings-mapper";
import type { ClinicalIntelligenceResult } from "./findings";

export async function getClinicalIntelligence(
  sessionId: string,
): Promise<ClinicalIntelligenceResult | null> {
  const envelope = await getMedicalCopilotClinicalIntelligence(sessionId);
  return mapIntelligenceEnvelope(envelope.data ?? envelope);
}

export type ClinicalFindingsReadAdapter = {
  getClinicalIntelligence: typeof getClinicalIntelligence;
};

export const clinicalFindingsReadAdapter: ClinicalFindingsReadAdapter = {
  getClinicalIntelligence,
};
