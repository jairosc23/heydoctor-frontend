import { getMedicalCopilotGovernedClinicalReasoningPipeline } from "../../api";
import { mapGovernedClinicalReasoningPipelineEnvelope } from "./governed-clinical-reasoning-pipeline-mapper";
import type { GovernedClinicalReasoningPipelineResult } from "./governed-clinical-reasoning-pipeline";
export async function getGovernedClinicalReasoningPipeline(sessionId: string): Promise<GovernedClinicalReasoningPipelineResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalReasoningPipeline(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalReasoningPipelineEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedClinicalReasoningPipelineReadAdapter = { getGovernedClinicalReasoningPipeline: typeof getGovernedClinicalReasoningPipeline };
export const governedClinicalReasoningPipelineReadAdapter: GovernedClinicalReasoningPipelineReadAdapter = { getGovernedClinicalReasoningPipeline };
