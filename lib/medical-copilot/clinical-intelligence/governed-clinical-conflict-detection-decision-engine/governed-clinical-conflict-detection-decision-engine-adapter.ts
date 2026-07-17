import { getMedicalCopilotGovernedClinicalConflictDetectionEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalConflictDetectionEngineEnvelope } from "./governed-clinical-conflict-detection-decision-engine-mapper";
import type { GovernedClinicalConflictDetectionEngineResult } from "./governed-clinical-conflict-detection-decision-engine";
export type GovernedClinicalConflictDetectionEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalConflictDetectionEngineResult | null> };
export async function getGovernedClinicalConflictDetectionEngine(sessionId: string): Promise<GovernedClinicalConflictDetectionEngineResult | null> {
  return mapGovernedClinicalConflictDetectionEngineEnvelope(await getMedicalCopilotGovernedClinicalConflictDetectionEngine(sessionId));
}
export const governedClinicalConflictDetectionEngineReadAdapter: GovernedClinicalConflictDetectionEngineReadAdapter = { get: getGovernedClinicalConflictDetectionEngine };
