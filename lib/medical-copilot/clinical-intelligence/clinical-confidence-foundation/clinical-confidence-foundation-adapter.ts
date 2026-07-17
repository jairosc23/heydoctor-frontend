import { getMedicalCopilotClinicalConfidenceFoundation } from "../../api";
import { mapClinicalConfidenceFoundationEnvelope } from "./clinical-confidence-foundation-mapper";
import type { ClinicalConfidenceFoundationBuilderResult } from "./clinical-confidence-foundation";

export async function getClinicalConfidenceFoundation(sessionId: string): Promise<ClinicalConfidenceFoundationBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalConfidenceFoundation(sessionId);
  return mapClinicalConfidenceFoundationEnvelope(envelope.data ?? envelope);
}

export type ClinicalConfidenceFoundationReadAdapter = { getClinicalConfidenceFoundation: typeof getClinicalConfidenceFoundation };
export const confidenceReadAdapter: ClinicalConfidenceFoundationReadAdapter = { getClinicalConfidenceFoundation };
