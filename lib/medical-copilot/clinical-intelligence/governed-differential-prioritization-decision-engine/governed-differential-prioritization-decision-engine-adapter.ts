import { getMedicalCopilotGovernedDifferentialPrioritizationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDifferentialPrioritizationEngineEnvelope } from "./governed-differential-prioritization-decision-engine-mapper";
import type { GovernedDifferentialPrioritizationEngineResult } from "./governed-differential-prioritization-decision-engine";
export type GovernedDifferentialPrioritizationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDifferentialPrioritizationEngineResult | null> };
export async function getGovernedDifferentialPrioritizationEngine(sessionId: string): Promise<GovernedDifferentialPrioritizationEngineResult | null> {
  return mapGovernedDifferentialPrioritizationEngineEnvelope(await getMedicalCopilotGovernedDifferentialPrioritizationEngine(sessionId));
}
export const governedDifferentialPrioritizationEngineReadAdapter: GovernedDifferentialPrioritizationEngineReadAdapter = { get: getGovernedDifferentialPrioritizationEngine };
