import { getMedicalCopilotGovernedClinicalIntelligenceFoundation } from "../../api";
import { mapGovernedClinicalIntelligenceFoundationEnvelope } from "./governed-clinical-intelligence-foundation-mapper";
import type { GovernedClinicalIntelligenceFoundationBuilderResult } from "./governed-clinical-intelligence-foundation";
export async function getGovernedClinicalIntelligenceFoundation(sessionId: string): Promise<GovernedClinicalIntelligenceFoundationBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalIntelligenceFoundation(sessionId);
  return mapGovernedClinicalIntelligenceFoundationEnvelope(envelope.data ?? envelope);
}
export type GovernedClinicalIntelligenceFoundationReadAdapter = { getGovernedClinicalIntelligenceFoundation: typeof getGovernedClinicalIntelligenceFoundation };
export const governedClinicalIntelligenceFoundationReadAdapter: GovernedClinicalIntelligenceFoundationReadAdapter = { getGovernedClinicalIntelligenceFoundation };
