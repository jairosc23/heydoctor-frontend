import { getMedicalCopilotGovernedClinicalContextStage } from "../../api";
import { mapGovernedClinicalContextStageEnvelope } from "./governed-clinical-context-stage-mapper";
import type { GovernedClinicalContextStageResult } from "./governed-clinical-context-stage";
export async function getGovernedClinicalContextStage(sessionId: string): Promise<GovernedClinicalContextStageResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalContextStage(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalContextStageEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedClinicalContextStageReadAdapter = { getGovernedClinicalContextStage: typeof getGovernedClinicalContextStage };
export const governedClinicalContextStageReadAdapter: GovernedClinicalContextStageReadAdapter = { getGovernedClinicalContextStage };
