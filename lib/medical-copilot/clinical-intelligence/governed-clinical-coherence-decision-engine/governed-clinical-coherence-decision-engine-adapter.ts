import { getMedicalCopilotGovernedClinicalCoherenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalCoherenceEngineEnvelope } from "./governed-clinical-coherence-decision-engine-mapper";
import type { GovernedClinicalCoherenceEngineResult } from "./governed-clinical-coherence-decision-engine";
export type GovernedClinicalCoherenceEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalCoherenceEngineResult | null> };
export async function getGovernedClinicalCoherenceEngine(sessionId: string): Promise<GovernedClinicalCoherenceEngineResult | null> {
  return mapGovernedClinicalCoherenceEngineEnvelope(await getMedicalCopilotGovernedClinicalCoherenceEngine(sessionId));
}
export const governedClinicalCoherenceEngineReadAdapter: GovernedClinicalCoherenceEngineReadAdapter = { get: getGovernedClinicalCoherenceEngine };
