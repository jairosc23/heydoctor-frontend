import { getMedicalCopilotClinicalReasoningEngineFoundation } from "../../api";
import { mapClinicalReasoningEngineFoundationEnvelope } from "./clinical-reasoning-engine-foundation-mapper";
import type { ClinicalReasoningEngineFoundationBuilderResult } from "./clinical-reasoning-engine-foundation";
export async function getClinicalReasoningEngineFoundation(sessionId: string): Promise<ClinicalReasoningEngineFoundationBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalReasoningEngineFoundation(sessionId);
  return mapClinicalReasoningEngineFoundationEnvelope(envelope.data ?? envelope);
}
export type ClinicalReasoningEngineFoundationReadAdapter = { getClinicalReasoningEngineFoundation: typeof getClinicalReasoningEngineFoundation };
export const clinicalReasoningEngineFoundationReadAdapter: ClinicalReasoningEngineFoundationReadAdapter = { getClinicalReasoningEngineFoundation };
