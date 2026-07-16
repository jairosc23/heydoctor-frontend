import { getMedicalCopilotGovernedClinicalDecisionRuntimeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalDecisionRuntimeEngineEnvelope } from "./governed-clinical-decision-runtime-engine-mapper";
import type { GovernedClinicalDecisionRuntimeEngineResult } from "./governed-clinical-decision-runtime-engine";
export type GovernedClinicalDecisionRuntimeEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalDecisionRuntimeEngineResult | null> };
export async function getGovernedClinicalDecisionRuntimeEngine(sessionId: string): Promise<GovernedClinicalDecisionRuntimeEngineResult | null> {
  return mapGovernedClinicalDecisionRuntimeEngineEnvelope(await getMedicalCopilotGovernedClinicalDecisionRuntimeEngine(sessionId));
}
export const governedClinicalDecisionRuntimeEngineReadAdapter: GovernedClinicalDecisionRuntimeEngineReadAdapter = { get: getGovernedClinicalDecisionRuntimeEngine };
