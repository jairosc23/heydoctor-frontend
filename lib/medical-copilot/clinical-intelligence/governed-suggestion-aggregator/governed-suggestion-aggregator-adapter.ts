import { getMedicalCopilotGovernedSuggestionAggregator } from "@/lib/medical-copilot/api";
import { mapGovernedSuggestionAggregatorEnvelope } from "./governed-suggestion-aggregator-mapper";
import type { GovernedSuggestionAggregatorResult } from "./governed-suggestion-aggregator";
export type GovernedSuggestionAggregatorReadAdapter = { get: (sessionId: string) => Promise<GovernedSuggestionAggregatorResult | null> };
export async function getGovernedSuggestionAggregator(sessionId: string): Promise<GovernedSuggestionAggregatorResult | null> { return mapGovernedSuggestionAggregatorEnvelope(await getMedicalCopilotGovernedSuggestionAggregator(sessionId)); }
export const governedSuggestionAggregatorReadAdapter: GovernedSuggestionAggregatorReadAdapter = { get: getGovernedSuggestionAggregator };
