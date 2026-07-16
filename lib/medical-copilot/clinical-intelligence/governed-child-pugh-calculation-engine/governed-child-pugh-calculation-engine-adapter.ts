import { getMedicalCopilotGovernedChildPughCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedChildPughCalculationEngineEnvelope } from "./governed-child-pugh-calculation-engine-mapper";
import type { GovernedChildPughCalculationEngineResult } from "./governed-child-pugh-calculation-engine";
export type GovernedChildPughCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedChildPughCalculationEngineResult | null> };
export async function getGovernedChildPughCalculationEngine(sessionId: string): Promise<GovernedChildPughCalculationEngineResult | null> {
  return mapGovernedChildPughCalculationEngineEnvelope(await getMedicalCopilotGovernedChildPughCalculationEngine(sessionId));
}
export const governedChildPughCalculationEngineReadAdapter: GovernedChildPughCalculationEngineReadAdapter = { get: getGovernedChildPughCalculationEngine };
