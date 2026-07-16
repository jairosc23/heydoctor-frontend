import { getMedicalCopilotGovernedDecisionSafetyEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDecisionSafetyEngineEnvelope } from "./governed-decision-safety-engine-mapper";
import type { GovernedDecisionSafetyEngineResult } from "./governed-decision-safety-engine";
export type GovernedDecisionSafetyEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDecisionSafetyEngineResult | null> };
export async function getGovernedDecisionSafetyEngine(sessionId: string): Promise<GovernedDecisionSafetyEngineResult | null> {
  return mapGovernedDecisionSafetyEngineEnvelope(await getMedicalCopilotGovernedDecisionSafetyEngine(sessionId));
}
export const governedDecisionSafetyEngineReadAdapter: GovernedDecisionSafetyEngineReadAdapter = { get: getGovernedDecisionSafetyEngine };
