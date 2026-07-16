import { getMedicalCopilotClinicalReasoningTrace } from "../../api";
import { mapClinicalReasoningTraceEnvelope } from "./clinical-reasoning-trace-mapper";
import type { ClinicalReasoningTraceBuilderResult } from "./clinical-reasoning-trace";
export async function getClinicalReasoningTrace(sessionId: string): Promise<ClinicalReasoningTraceBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalReasoningTrace(sessionId);
  return mapClinicalReasoningTraceEnvelope(envelope.data ?? envelope);
}
export type ClinicalReasoningTraceReadAdapter = { getClinicalReasoningTrace: typeof getClinicalReasoningTrace };
export const clinicalReasoningTraceReadAdapter: ClinicalReasoningTraceReadAdapter = { getClinicalReasoningTrace };
