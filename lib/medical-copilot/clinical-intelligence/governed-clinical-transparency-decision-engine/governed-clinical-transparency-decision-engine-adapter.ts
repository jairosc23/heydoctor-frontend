import { getMedicalCopilotGovernedClinicalTransparencyEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalTransparencyEngineEnvelope } from "./governed-clinical-transparency-decision-engine-mapper";
import type { GovernedClinicalTransparencyEngineResult } from "./governed-clinical-transparency-decision-engine";
export type GovernedClinicalTransparencyEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalTransparencyEngineResult | null> };
export async function getGovernedClinicalTransparencyEngine(sessionId: string): Promise<GovernedClinicalTransparencyEngineResult | null> {
  return mapGovernedClinicalTransparencyEngineEnvelope(await getMedicalCopilotGovernedClinicalTransparencyEngine(sessionId));
}
export const governedClinicalTransparencyEngineReadAdapter: GovernedClinicalTransparencyEngineReadAdapter = { get: getGovernedClinicalTransparencyEngine };
