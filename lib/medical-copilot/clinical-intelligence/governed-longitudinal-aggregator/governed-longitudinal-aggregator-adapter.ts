import { getMedicalCopilotGovernedLongitudinalAggregator } from "@/lib/medical-copilot/api";
import { mapGovernedLongitudinalAggregatorEnvelope } from "./governed-longitudinal-aggregator-mapper";
import type { GovernedLongitudinalAggregatorResult } from "./governed-longitudinal-aggregator";
export type GovernedLongitudinalAggregatorReadAdapter = { get: (sessionId: string) => Promise<GovernedLongitudinalAggregatorResult | null> };
export async function getGovernedLongitudinalAggregator(sessionId: string): Promise<GovernedLongitudinalAggregatorResult | null> { return mapGovernedLongitudinalAggregatorEnvelope(await getMedicalCopilotGovernedLongitudinalAggregator(sessionId)); }
export const governedLongitudinalAggregatorReadAdapter: GovernedLongitudinalAggregatorReadAdapter = { get: getGovernedLongitudinalAggregator };
