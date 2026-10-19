import { getMedicalCopilotGovernedWellsDvtCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedWellsDvtCalculationEngineEnvelope } from "./governed-wells-dvt-calculation-engine-mapper";
import type { GovernedWellsDvtCalculationEngineResult } from "./governed-wells-dvt-calculation-engine";
export type GovernedWellsDvtCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedWellsDvtCalculationEngineResult | null> };
export async function getGovernedWellsDvtCalculationEngine(sessionId: string): Promise<GovernedWellsDvtCalculationEngineResult | null> {
  return mapGovernedWellsDvtCalculationEngineEnvelope(await getMedicalCopilotGovernedWellsDvtCalculationEngine(sessionId));
}
export const governedWellsDvtCalculationEngineReadAdapter: GovernedWellsDvtCalculationEngineReadAdapter = { get: getGovernedWellsDvtCalculationEngine };
