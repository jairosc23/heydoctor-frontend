import { getMedicalCopilotClinicalReasoningEngineCore } from "../../api";
import { mapClinicalReasoningEngineCoreEnvelope } from "./clinical-reasoning-engine-core-mapper";
import type { ClinicalReasoningEngineCoreBuilderResult } from "./clinical-reasoning-engine-core";
export async function getClinicalReasoningEngineCore(sessionId: string): Promise<ClinicalReasoningEngineCoreBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalReasoningEngineCore(sessionId);
  return mapClinicalReasoningEngineCoreEnvelope(envelope.data ?? envelope);
}
export type ClinicalReasoningEngineCoreReadAdapter = { getClinicalReasoningEngineCore: typeof getClinicalReasoningEngineCore };
export const clinicalReasoningEngineCoreReadAdapter: ClinicalReasoningEngineCoreReadAdapter = { getClinicalReasoningEngineCore };
