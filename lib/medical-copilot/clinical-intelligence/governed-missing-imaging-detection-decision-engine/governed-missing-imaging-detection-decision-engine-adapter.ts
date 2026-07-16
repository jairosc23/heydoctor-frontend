import { getMedicalCopilotGovernedMissingImagingDetectionEngine } from "@/lib/medical-copilot/api";
import { mapGovernedMissingImagingDetectionEngineEnvelope } from "./governed-missing-imaging-detection-decision-engine-mapper";
import type { GovernedMissingImagingDetectionEngineResult } from "./governed-missing-imaging-detection-decision-engine";
export type GovernedMissingImagingDetectionEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedMissingImagingDetectionEngineResult | null> };
export async function getGovernedMissingImagingDetectionEngine(sessionId: string): Promise<GovernedMissingImagingDetectionEngineResult | null> {
  return mapGovernedMissingImagingDetectionEngineEnvelope(await getMedicalCopilotGovernedMissingImagingDetectionEngine(sessionId));
}
export const governedMissingImagingDetectionEngineReadAdapter: GovernedMissingImagingDetectionEngineReadAdapter = { get: getGovernedMissingImagingDetectionEngine };
