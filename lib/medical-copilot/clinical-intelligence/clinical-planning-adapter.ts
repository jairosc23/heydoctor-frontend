/**
 * CI-10 — Read adapter for Clinical Plan (Facade only).
 */

import { getMedicalCopilotClinicalPlan } from "../api";
import { mapClinicalPlanEnvelope } from "./clinical-planning-mapper";
import type { ClinicalPlanResult } from "./clinical-planning";

export async function getClinicalPlan(
  sessionId: string,
): Promise<ClinicalPlanResult | null> {
  const envelope = await getMedicalCopilotClinicalPlan(sessionId);
  return mapClinicalPlanEnvelope(envelope.data ?? envelope);
}

export type ClinicalPlanReadAdapter = {
  getClinicalPlan: typeof getClinicalPlan;
};

export const clinicalPlanReadAdapter: ClinicalPlanReadAdapter = {
  getClinicalPlan,
};
