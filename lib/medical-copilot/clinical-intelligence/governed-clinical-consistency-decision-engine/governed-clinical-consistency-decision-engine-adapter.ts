import { getMedicalCopilotGovernedClinicalConsistencyEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalConsistencyEngineEnvelope } from "./governed-clinical-consistency-decision-engine-mapper";
import type { GovernedClinicalConsistencyEngineResult } from "./governed-clinical-consistency-decision-engine";
export type GovernedClinicalConsistencyEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalConsistencyEngineResult | null> };
export async function getGovernedClinicalConsistencyEngine(sessionId: string): Promise<GovernedClinicalConsistencyEngineResult | null> {
  return mapGovernedClinicalConsistencyEngineEnvelope(await getMedicalCopilotGovernedClinicalConsistencyEngine(sessionId));
}
export const governedClinicalConsistencyEngineReadAdapter: GovernedClinicalConsistencyEngineReadAdapter = { get: getGovernedClinicalConsistencyEngine };
