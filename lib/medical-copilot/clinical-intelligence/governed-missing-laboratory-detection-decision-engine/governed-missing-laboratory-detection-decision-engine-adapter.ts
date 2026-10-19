import { getMedicalCopilotGovernedMissingLaboratoryDetectionEngine } from "@/lib/medical-copilot/api";
import { mapGovernedMissingLaboratoryDetectionEngineEnvelope } from "./governed-missing-laboratory-detection-decision-engine-mapper";
import type { GovernedMissingLaboratoryDetectionEngineResult } from "./governed-missing-laboratory-detection-decision-engine";
export type GovernedMissingLaboratoryDetectionEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedMissingLaboratoryDetectionEngineResult | null> };
export async function getGovernedMissingLaboratoryDetectionEngine(sessionId: string): Promise<GovernedMissingLaboratoryDetectionEngineResult | null> {
  return mapGovernedMissingLaboratoryDetectionEngineEnvelope(await getMedicalCopilotGovernedMissingLaboratoryDetectionEngine(sessionId));
}
export const governedMissingLaboratoryDetectionEngineReadAdapter: GovernedMissingLaboratoryDetectionEngineReadAdapter = { get: getGovernedMissingLaboratoryDetectionEngine };
