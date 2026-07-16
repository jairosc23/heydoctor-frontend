import { getMedicalCopilotGovernedPersistenceAggregator } from "@/lib/medical-copilot/api";
import { mapGovernedPersistenceAggregatorEnvelope } from "./governed-persistence-aggregator-mapper";
import type { GovernedPersistenceAggregatorResult } from "./governed-persistence-aggregator";
export type GovernedPersistenceAggregatorReadAdapter = { get: (sessionId: string) => Promise<GovernedPersistenceAggregatorResult | null> };
export async function getGovernedPersistenceAggregator(sessionId: string): Promise<GovernedPersistenceAggregatorResult | null> { return mapGovernedPersistenceAggregatorEnvelope(await getMedicalCopilotGovernedPersistenceAggregator(sessionId)); }
export const governedPersistenceAggregatorReadAdapter: GovernedPersistenceAggregatorReadAdapter = { get: getGovernedPersistenceAggregator };
