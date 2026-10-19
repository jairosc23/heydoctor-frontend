import { getMedicalCopilotGovernedDecisionGovernanceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDecisionGovernanceEngineEnvelope } from "./governed-decision-governance-engine-mapper";
import type { GovernedDecisionGovernanceEngineResult } from "./governed-decision-governance-engine";
export type GovernedDecisionGovernanceEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDecisionGovernanceEngineResult | null> };
export async function getGovernedDecisionGovernanceEngine(sessionId: string): Promise<GovernedDecisionGovernanceEngineResult | null> {
  return mapGovernedDecisionGovernanceEngineEnvelope(await getMedicalCopilotGovernedDecisionGovernanceEngine(sessionId));
}
export const governedDecisionGovernanceEngineReadAdapter: GovernedDecisionGovernanceEngineReadAdapter = { get: getGovernedDecisionGovernanceEngine };
