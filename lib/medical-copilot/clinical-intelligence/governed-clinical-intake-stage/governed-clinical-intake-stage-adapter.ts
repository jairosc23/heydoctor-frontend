import { getMedicalCopilotGovernedClinicalIntakeStage } from "../../api";
import { mapGovernedClinicalIntakeStageEnvelope } from "./governed-clinical-intake-stage-mapper";
import type { GovernedClinicalIntakeStageResult } from "./governed-clinical-intake-stage";
export async function getGovernedClinicalIntakeStage(sessionId: string): Promise<GovernedClinicalIntakeStageResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalIntakeStage(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalIntakeStageEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedClinicalIntakeStageReadAdapter = { getGovernedClinicalIntakeStage: typeof getGovernedClinicalIntakeStage };
export const governedClinicalIntakeStageReadAdapter: GovernedClinicalIntakeStageReadAdapter = { getGovernedClinicalIntakeStage };
