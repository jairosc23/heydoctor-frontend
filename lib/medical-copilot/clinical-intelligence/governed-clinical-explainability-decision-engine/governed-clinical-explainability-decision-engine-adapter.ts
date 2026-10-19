import { getMedicalCopilotGovernedClinicalExplainabilityEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalExplainabilityEngineEnvelope } from "./governed-clinical-explainability-decision-engine-mapper";
import type { GovernedClinicalExplainabilityEngineResult } from "./governed-clinical-explainability-decision-engine";
export type GovernedClinicalExplainabilityEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalExplainabilityEngineResult | null> };
export async function getGovernedClinicalExplainabilityEngine(sessionId: string): Promise<GovernedClinicalExplainabilityEngineResult | null> {
  return mapGovernedClinicalExplainabilityEngineEnvelope(await getMedicalCopilotGovernedClinicalExplainabilityEngine(sessionId));
}
export const governedClinicalExplainabilityEngineReadAdapter: GovernedClinicalExplainabilityEngineReadAdapter = { get: getGovernedClinicalExplainabilityEngine };
