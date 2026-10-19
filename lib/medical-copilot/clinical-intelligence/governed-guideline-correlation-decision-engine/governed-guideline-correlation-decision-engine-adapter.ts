import { getMedicalCopilotGovernedGuidelineCorrelationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedGuidelineCorrelationEngineEnvelope } from "./governed-guideline-correlation-decision-engine-mapper";
import type { GovernedGuidelineCorrelationEngineResult } from "./governed-guideline-correlation-decision-engine";
export type GovernedGuidelineCorrelationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedGuidelineCorrelationEngineResult | null> };
export async function getGovernedGuidelineCorrelationEngine(sessionId: string): Promise<GovernedGuidelineCorrelationEngineResult | null> {
  return mapGovernedGuidelineCorrelationEngineEnvelope(await getMedicalCopilotGovernedGuidelineCorrelationEngine(sessionId));
}
export const governedGuidelineCorrelationEngineReadAdapter: GovernedGuidelineCorrelationEngineReadAdapter = { get: getGovernedGuidelineCorrelationEngine };
