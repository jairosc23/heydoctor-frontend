import { getMedicalCopilotGovernedSafetyAggregator } from "@/lib/medical-copilot/api";
import { mapGovernedSafetyAggregatorEnvelope } from "./governed-safety-aggregator-mapper";
import type { GovernedSafetyAggregatorResult } from "./governed-safety-aggregator";
export type GovernedSafetyAggregatorReadAdapter = { get: (sessionId: string) => Promise<GovernedSafetyAggregatorResult | null> };
export async function getGovernedSafetyAggregator(sessionId: string): Promise<GovernedSafetyAggregatorResult | null> { return mapGovernedSafetyAggregatorEnvelope(await getMedicalCopilotGovernedSafetyAggregator(sessionId)); }
export const governedSafetyAggregatorReadAdapter: GovernedSafetyAggregatorReadAdapter = { get: getGovernedSafetyAggregator };
