import { getMedicalCopilotGovernedClinicalTraceabilityEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalTraceabilityEngineEnvelope } from "./governed-clinical-traceability-decision-engine-mapper";
import type { GovernedClinicalTraceabilityEngineResult } from "./governed-clinical-traceability-decision-engine";
export type GovernedClinicalTraceabilityEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalTraceabilityEngineResult | null> };
export async function getGovernedClinicalTraceabilityEngine(sessionId: string): Promise<GovernedClinicalTraceabilityEngineResult | null> {
  return mapGovernedClinicalTraceabilityEngineEnvelope(await getMedicalCopilotGovernedClinicalTraceabilityEngine(sessionId));
}
export const governedClinicalTraceabilityEngineReadAdapter: GovernedClinicalTraceabilityEngineReadAdapter = { get: getGovernedClinicalTraceabilityEngine };
