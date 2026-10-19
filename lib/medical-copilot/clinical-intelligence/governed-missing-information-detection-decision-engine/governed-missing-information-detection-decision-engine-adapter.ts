import { getMedicalCopilotGovernedMissingInformationDetectionEngine } from "@/lib/medical-copilot/api";
import { mapGovernedMissingInformationDetectionEngineEnvelope } from "./governed-missing-information-detection-decision-engine-mapper";
import type { GovernedMissingInformationDetectionEngineResult } from "./governed-missing-information-detection-decision-engine";
export type GovernedMissingInformationDetectionEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedMissingInformationDetectionEngineResult | null> };
export async function getGovernedMissingInformationDetectionEngine(sessionId: string): Promise<GovernedMissingInformationDetectionEngineResult | null> {
  return mapGovernedMissingInformationDetectionEngineEnvelope(await getMedicalCopilotGovernedMissingInformationDetectionEngine(sessionId));
}
export const governedMissingInformationDetectionEngineReadAdapter: GovernedMissingInformationDetectionEngineReadAdapter = { get: getGovernedMissingInformationDetectionEngine };
