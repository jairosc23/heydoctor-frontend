import { getMedicalCopilotClinicalIntelligenceRuntime } from "../../api";
import { mapClinicalIntelligenceRuntimeEnvelope } from "./clinical-intelligence-runtime-mapper";
import type { ClinicalIntelligenceRuntimeBuilderResult } from "./clinical-intelligence-runtime";
export async function getClinicalIntelligenceRuntime(sessionId: string): Promise<ClinicalIntelligenceRuntimeBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalIntelligenceRuntime(sessionId);
  return mapClinicalIntelligenceRuntimeEnvelope(envelope.data ?? envelope);
}
export type ClinicalIntelligenceRuntimeReadAdapter = { getClinicalIntelligenceRuntime: typeof getClinicalIntelligenceRuntime };
export const clinicalIntelligenceRuntimeReadAdapter: ClinicalIntelligenceRuntimeReadAdapter = { getClinicalIntelligenceRuntime };
