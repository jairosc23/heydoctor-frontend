import { getMedicalCopilotGovernedCalculationRuntimeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedCalculationRuntimeEngineEnvelope } from "./governed-calculation-runtime-engine-mapper";
import type { GovernedCalculationRuntimeEngineResult } from "./governed-calculation-runtime-engine";
export type GovernedCalculationRuntimeEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedCalculationRuntimeEngineResult | null> };
export async function getGovernedCalculationRuntimeEngine(sessionId: string): Promise<GovernedCalculationRuntimeEngineResult | null> {
  return mapGovernedCalculationRuntimeEngineEnvelope(await getMedicalCopilotGovernedCalculationRuntimeEngine(sessionId));
}
export const governedCalculationRuntimeEngineReadAdapter: GovernedCalculationRuntimeEngineReadAdapter = { get: getGovernedCalculationRuntimeEngine };
