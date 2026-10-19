import { getMedicalCopilotClinicalIntelligenceTrace } from "../../api";
import { mapClinicalIntelligenceTraceEnvelope } from "./clinical-intelligence-trace-mapper";
import type { ClinicalIntelligenceTraceBuilderResult } from "./clinical-intelligence-trace";
export async function getClinicalIntelligenceTrace(sessionId: string): Promise<ClinicalIntelligenceTraceBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalIntelligenceTrace(sessionId);
  return mapClinicalIntelligenceTraceEnvelope(envelope.data ?? envelope);
}
export type ClinicalIntelligenceTraceReadAdapter = { getClinicalIntelligenceTrace: typeof getClinicalIntelligenceTrace };
export const clinicalIntelligenceTraceReadAdapter: ClinicalIntelligenceTraceReadAdapter = { getClinicalIntelligenceTrace };
