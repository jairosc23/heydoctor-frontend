import { getMedicalCopilotGovernedCalculationAggregator } from "@/lib/medical-copilot/api";
import { mapGovernedCalculationAggregatorEnvelope } from "./governed-calculation-aggregator-mapper";
import type { GovernedCalculationAggregatorResult } from "./governed-calculation-aggregator";
export type GovernedCalculationAggregatorReadAdapter = { get: (sessionId: string) => Promise<GovernedCalculationAggregatorResult | null> };
export async function getGovernedCalculationAggregator(sessionId: string): Promise<GovernedCalculationAggregatorResult | null> { return mapGovernedCalculationAggregatorEnvelope(await getMedicalCopilotGovernedCalculationAggregator(sessionId)); }
export const governedCalculationAggregatorReadAdapter: GovernedCalculationAggregatorReadAdapter = { get: getGovernedCalculationAggregator };
