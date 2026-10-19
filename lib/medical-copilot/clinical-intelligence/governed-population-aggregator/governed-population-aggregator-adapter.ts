import { getMedicalCopilotGovernedPopulationAggregator } from "@/lib/medical-copilot/api";
import { mapGovernedPopulationAggregatorEnvelope } from "./governed-population-aggregator-mapper";
import type { GovernedPopulationAggregatorResult } from "./governed-population-aggregator";
export type GovernedPopulationAggregatorReadAdapter = { get: (sessionId: string) => Promise<GovernedPopulationAggregatorResult | null> };
export async function getGovernedPopulationAggregator(sessionId: string): Promise<GovernedPopulationAggregatorResult | null> { return mapGovernedPopulationAggregatorEnvelope(await getMedicalCopilotGovernedPopulationAggregator(sessionId)); }
export const governedPopulationAggregatorReadAdapter: GovernedPopulationAggregatorReadAdapter = { get: getGovernedPopulationAggregator };
