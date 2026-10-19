import { getMedicalCopilotClinicalReasoningPipeline } from "../../api";
import { mapClinicalReasoningPipelineEnvelope } from "./clinical-reasoning-pipeline-mapper";
import type { ClinicalReasoningPipelineBuilderResult } from "./clinical-reasoning-pipeline";
export async function getClinicalReasoningPipeline(sessionId: string): Promise<ClinicalReasoningPipelineBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalReasoningPipeline(sessionId);
  return mapClinicalReasoningPipelineEnvelope(envelope.data ?? envelope);
}
export type ClinicalReasoningPipelineReadAdapter = { getClinicalReasoningPipeline: typeof getClinicalReasoningPipeline };
export const clinicalReasoningPipelineReadAdapter: ClinicalReasoningPipelineReadAdapter = { getClinicalReasoningPipeline };
