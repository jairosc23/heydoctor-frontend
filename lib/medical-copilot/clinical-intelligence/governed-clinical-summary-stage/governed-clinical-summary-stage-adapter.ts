import { getMedicalCopilotGovernedClinicalSummaryStage } from "../../api";
import { mapGovernedClinicalSummaryStageEnvelope } from "./governed-clinical-summary-stage-mapper";
import type { GovernedClinicalSummaryStageResult } from "./governed-clinical-summary-stage";
export async function getGovernedClinicalSummaryStage(sessionId: string): Promise<GovernedClinicalSummaryStageResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalSummaryStage(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalSummaryStageEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedClinicalSummaryStageReadAdapter = { getGovernedClinicalSummaryStage: typeof getGovernedClinicalSummaryStage };
export const governedClinicalSummaryStageReadAdapter: GovernedClinicalSummaryStageReadAdapter = { getGovernedClinicalSummaryStage };
