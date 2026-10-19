import { getMedicalCopilotClinicalReasoningRuntimeFoundation } from "../../api";
import { mapClinicalReasoningRuntimeFoundationEnvelope } from "./clinical-reasoning-runtime-foundation-mapper";
import type { ClinicalReasoningRuntimeFoundationBuilderResult } from "./clinical-reasoning-runtime-foundation";
export async function getClinicalReasoningRuntimeFoundation(sessionId: string): Promise<ClinicalReasoningRuntimeFoundationBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalReasoningRuntimeFoundation(sessionId);
  return mapClinicalReasoningRuntimeFoundationEnvelope(envelope.data ?? envelope);
}
export type ClinicalReasoningRuntimeFoundationReadAdapter = { getClinicalReasoningRuntimeFoundation: typeof getClinicalReasoningRuntimeFoundation };
export const clinicalReasoningRuntimeFoundationReadAdapter: ClinicalReasoningRuntimeFoundationReadAdapter = { getClinicalReasoningRuntimeFoundation };
