import { getMedicalCopilotClinicalIntelligenceContext } from "../../api";
import { mapClinicalIntelligenceContextEnvelope } from "./clinical-intelligence-context-mapper";
import type { ClinicalIntelligenceContextBuilderResult } from "./clinical-intelligence-context";
export async function getClinicalIntelligenceContext(sessionId: string): Promise<ClinicalIntelligenceContextBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalIntelligenceContext(sessionId);
  return mapClinicalIntelligenceContextEnvelope(envelope.data ?? envelope);
}
export type ClinicalIntelligenceContextReadAdapter = { getClinicalIntelligenceContext: typeof getClinicalIntelligenceContext };
export const clinicalIntelligenceContextReadAdapter: ClinicalIntelligenceContextReadAdapter = { getClinicalIntelligenceContext };
