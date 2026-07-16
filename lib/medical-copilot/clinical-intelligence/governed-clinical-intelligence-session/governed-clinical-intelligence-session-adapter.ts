import { getMedicalCopilotGovernedClinicalIntelligenceSession } from "../../api";
import { mapGovernedClinicalIntelligenceSessionEnvelope } from "./governed-clinical-intelligence-session-mapper";
import type { GovernedClinicalIntelligenceSessionBuilderResult } from "./governed-clinical-intelligence-session";
export async function getGovernedClinicalIntelligenceSession(sessionId: string): Promise<GovernedClinicalIntelligenceSessionBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalIntelligenceSession(sessionId);
  return mapGovernedClinicalIntelligenceSessionEnvelope(envelope.data ?? envelope);
}
export type GovernedClinicalIntelligenceSessionReadAdapter = { getGovernedClinicalIntelligenceSession: typeof getGovernedClinicalIntelligenceSession };
export const governedClinicalIntelligenceSessionReadAdapter: GovernedClinicalIntelligenceSessionReadAdapter = { getGovernedClinicalIntelligenceSession };
