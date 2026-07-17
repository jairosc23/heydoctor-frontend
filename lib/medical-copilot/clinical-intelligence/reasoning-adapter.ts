/**
 * CI-5 — Read adapter for Governed Clinical Reasoning Engine (Facade only).
 */

import { getMedicalCopilotGovernedClinicalReasoning } from "../api";
import { mapReasoningEnvelope } from "./reasoning-mapper";
import type { ClinicalReasoningResult } from "./reasoning";

export async function getGovernedClinicalReasoning(
  sessionId: string,
): Promise<ClinicalReasoningResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalReasoning(sessionId);
  return mapReasoningEnvelope(envelope.data ?? envelope);
}

export type ClinicalReasoningReadAdapter = {
  getGovernedClinicalReasoning: typeof getGovernedClinicalReasoning;
};

export const clinicalReasoningReadAdapter: ClinicalReasoningReadAdapter = {
  getGovernedClinicalReasoning,
};
