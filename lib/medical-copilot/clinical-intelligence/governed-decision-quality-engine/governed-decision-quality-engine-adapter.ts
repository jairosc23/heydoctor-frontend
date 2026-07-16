import { getMedicalCopilotGovernedDecisionQualityEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDecisionQualityEngineEnvelope } from "./governed-decision-quality-engine-mapper";
import type { GovernedDecisionQualityEngineResult } from "./governed-decision-quality-engine";
export type GovernedDecisionQualityEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDecisionQualityEngineResult | null> };
export async function getGovernedDecisionQualityEngine(sessionId: string): Promise<GovernedDecisionQualityEngineResult | null> {
  return mapGovernedDecisionQualityEngineEnvelope(await getMedicalCopilotGovernedDecisionQualityEngine(sessionId));
}
export const governedDecisionQualityEngineReadAdapter: GovernedDecisionQualityEngineReadAdapter = { get: getGovernedDecisionQualityEngine };
