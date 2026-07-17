import { getMedicalCopilotGovernedClinicalIntelligenceStage } from "../../api";
import { mapGovernedClinicalIntelligenceStageEnvelope } from "./governed-clinical-intelligence-stage-mapper";
import type { GovernedClinicalIntelligenceStageResult } from "./governed-clinical-intelligence-stage";
export async function getGovernedClinicalIntelligenceStage(sessionId: string): Promise<GovernedClinicalIntelligenceStageResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalIntelligenceStage(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalIntelligenceStageEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedClinicalIntelligenceStageReadAdapter = { getGovernedClinicalIntelligenceStage: typeof getGovernedClinicalIntelligenceStage };
export const governedClinicalIntelligenceStageReadAdapter: GovernedClinicalIntelligenceStageReadAdapter = { getGovernedClinicalIntelligenceStage };
