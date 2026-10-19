import { getMedicalCopilotClinicalReasoningContext } from "../../api";
import { mapClinicalReasoningContextEnvelope } from "./clinical-reasoning-context-mapper";
import type { ClinicalReasoningContextBuilderResult } from "./clinical-reasoning-context";
export async function getClinicalReasoningContext(sessionId: string): Promise<ClinicalReasoningContextBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalReasoningContext(sessionId);
  return mapClinicalReasoningContextEnvelope(envelope.data ?? envelope);
}
export type ClinicalReasoningContextReadAdapter = { getClinicalReasoningContext: typeof getClinicalReasoningContext };
export const clinicalReasoningContextReadAdapter: ClinicalReasoningContextReadAdapter = { getClinicalReasoningContext };
