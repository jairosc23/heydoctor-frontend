import { getMedicalCopilotGovernedMissingHistoryDetectionEngine } from "@/lib/medical-copilot/api";
import { mapGovernedMissingHistoryDetectionEngineEnvelope } from "./governed-missing-history-detection-decision-engine-mapper";
import type { GovernedMissingHistoryDetectionEngineResult } from "./governed-missing-history-detection-decision-engine";
export type GovernedMissingHistoryDetectionEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedMissingHistoryDetectionEngineResult | null> };
export async function getGovernedMissingHistoryDetectionEngine(sessionId: string): Promise<GovernedMissingHistoryDetectionEngineResult | null> {
  return mapGovernedMissingHistoryDetectionEngineEnvelope(await getMedicalCopilotGovernedMissingHistoryDetectionEngine(sessionId));
}
export const governedMissingHistoryDetectionEngineReadAdapter: GovernedMissingHistoryDetectionEngineReadAdapter = { get: getGovernedMissingHistoryDetectionEngine };
