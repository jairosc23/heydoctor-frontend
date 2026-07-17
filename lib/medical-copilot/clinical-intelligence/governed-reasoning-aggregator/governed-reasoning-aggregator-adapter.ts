import { getMedicalCopilotGovernedReasoningAggregator } from "@/lib/medical-copilot/api";
import { mapGovernedReasoningAggregatorEnvelope } from "./governed-reasoning-aggregator-mapper";
import type { GovernedReasoningAggregatorResult } from "./governed-reasoning-aggregator";
export type GovernedReasoningAggregatorReadAdapter = { get: (sessionId: string) => Promise<GovernedReasoningAggregatorResult | null> };
export async function getGovernedReasoningAggregator(sessionId: string): Promise<GovernedReasoningAggregatorResult | null> { return mapGovernedReasoningAggregatorEnvelope(await getMedicalCopilotGovernedReasoningAggregator(sessionId)); }
export const governedReasoningAggregatorReadAdapter: GovernedReasoningAggregatorReadAdapter = { get: getGovernedReasoningAggregator };
