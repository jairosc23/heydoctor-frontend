import { getMedicalCopilotGovernedGovernanceAggregator } from "@/lib/medical-copilot/api";
import { mapGovernedGovernanceAggregatorEnvelope } from "./governed-governance-aggregator-mapper";
import type { GovernedGovernanceAggregatorResult } from "./governed-governance-aggregator";
export type GovernedGovernanceAggregatorReadAdapter = { get: (sessionId: string) => Promise<GovernedGovernanceAggregatorResult | null> };
export async function getGovernedGovernanceAggregator(sessionId: string): Promise<GovernedGovernanceAggregatorResult | null> { return mapGovernedGovernanceAggregatorEnvelope(await getMedicalCopilotGovernedGovernanceAggregator(sessionId)); }
export const governedGovernanceAggregatorReadAdapter: GovernedGovernanceAggregatorReadAdapter = { get: getGovernedGovernanceAggregator };
