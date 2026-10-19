/**
 * CI-4 — Read adapter for Clinical Decision Support Engine (Facade only).
 */

import { getMedicalCopilotClinicalDecisionSupport } from "../api";
import { mapDecisionsEnvelope } from "./decisions-mapper";
import type { ClinicalDecisionResult } from "./decisions";

export async function getClinicalDecisionSupport(
  sessionId: string,
): Promise<ClinicalDecisionResult | null> {
  const envelope = await getMedicalCopilotClinicalDecisionSupport(sessionId);
  return mapDecisionsEnvelope(envelope.data ?? envelope);
}

export type ClinicalDecisionSupportReadAdapter = {
  getClinicalDecisionSupport: typeof getClinicalDecisionSupport;
};

export const clinicalDecisionSupportReadAdapter: ClinicalDecisionSupportReadAdapter =
  {
    getClinicalDecisionSupport,
  };
