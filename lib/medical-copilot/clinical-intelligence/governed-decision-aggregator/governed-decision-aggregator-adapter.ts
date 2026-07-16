import { getMedicalCopilotGovernedDecisionAggregator } from "@/lib/medical-copilot/api";
import { mapGovernedDecisionAggregatorEnvelope } from "./governed-decision-aggregator-mapper";
import type { GovernedDecisionAggregatorResult } from "./governed-decision-aggregator";
export type GovernedDecisionAggregatorReadAdapter = { get: (sessionId: string) => Promise<GovernedDecisionAggregatorResult | null> };
export async function getGovernedDecisionAggregator(sessionId: string): Promise<GovernedDecisionAggregatorResult | null> { return mapGovernedDecisionAggregatorEnvelope(await getMedicalCopilotGovernedDecisionAggregator(sessionId)); }
export const governedDecisionAggregatorReadAdapter: GovernedDecisionAggregatorReadAdapter = { get: getGovernedDecisionAggregator };
