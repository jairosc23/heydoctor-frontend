import { getMedicalCopilotGovernedRuleAggregator } from "@/lib/medical-copilot/api";
import { mapGovernedRuleAggregatorEnvelope } from "./governed-rule-aggregator-mapper";
import type { GovernedRuleAggregatorResult } from "./governed-rule-aggregator";
export type GovernedRuleAggregatorReadAdapter = { get: (sessionId: string) => Promise<GovernedRuleAggregatorResult | null> };
export async function getGovernedRuleAggregator(sessionId: string): Promise<GovernedRuleAggregatorResult | null> { return mapGovernedRuleAggregatorEnvelope(await getMedicalCopilotGovernedRuleAggregator(sessionId)); }
export const governedRuleAggregatorReadAdapter: GovernedRuleAggregatorReadAdapter = { get: getGovernedRuleAggregator };
