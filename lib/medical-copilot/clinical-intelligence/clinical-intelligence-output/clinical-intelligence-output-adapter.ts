import { getMedicalCopilotClinicalIntelligenceOutput } from "../../api";
import { mapClinicalIntelligenceOutputEnvelope } from "./clinical-intelligence-output-mapper";
import type { ClinicalIntelligenceOutputBuilderResult } from "./clinical-intelligence-output";
export async function getClinicalIntelligenceOutput(sessionId: string): Promise<ClinicalIntelligenceOutputBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalIntelligenceOutput(sessionId);
  return mapClinicalIntelligenceOutputEnvelope(envelope.data ?? envelope);
}
export type ClinicalIntelligenceOutputReadAdapter = { getClinicalIntelligenceOutput: typeof getClinicalIntelligenceOutput };
export const clinicalIntelligenceOutputReadAdapter: ClinicalIntelligenceOutputReadAdapter = { getClinicalIntelligenceOutput };
