import { getMedicalCopilotGovernedEvidenceCorrelationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedEvidenceCorrelationEngineEnvelope } from "./governed-evidence-correlation-decision-engine-mapper";
import type { GovernedEvidenceCorrelationEngineResult } from "./governed-evidence-correlation-decision-engine";
export type GovernedEvidenceCorrelationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedEvidenceCorrelationEngineResult | null> };
export async function getGovernedEvidenceCorrelationEngine(sessionId: string): Promise<GovernedEvidenceCorrelationEngineResult | null> {
  return mapGovernedEvidenceCorrelationEngineEnvelope(await getMedicalCopilotGovernedEvidenceCorrelationEngine(sessionId));
}
export const governedEvidenceCorrelationEngineReadAdapter: GovernedEvidenceCorrelationEngineReadAdapter = { get: getGovernedEvidenceCorrelationEngine };
