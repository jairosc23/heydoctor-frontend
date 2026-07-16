import { getMedicalCopilotClinicalIntelligenceValidation } from "../../api";
import { mapClinicalIntelligenceValidationEnvelope } from "./clinical-intelligence-validation-mapper";
import type { ClinicalIntelligenceValidationBuilderResult } from "./clinical-intelligence-validation";
export async function getClinicalIntelligenceValidation(sessionId: string): Promise<ClinicalIntelligenceValidationBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalIntelligenceValidation(sessionId);
  return mapClinicalIntelligenceValidationEnvelope(envelope.data ?? envelope);
}
export type ClinicalIntelligenceValidationReadAdapter = { getClinicalIntelligenceValidation: typeof getClinicalIntelligenceValidation };
export const clinicalIntelligenceValidationReadAdapter: ClinicalIntelligenceValidationReadAdapter = { getClinicalIntelligenceValidation };
