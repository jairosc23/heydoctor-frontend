import { getMedicalCopilotGovernedTherapeuticAggregator } from "@/lib/medical-copilot/api";
import { mapGovernedTherapeuticAggregatorEnvelope } from "./governed-therapeutic-aggregator-mapper";
import type { GovernedTherapeuticAggregatorResult } from "./governed-therapeutic-aggregator";
export type GovernedTherapeuticAggregatorReadAdapter = { get: (sessionId: string) => Promise<GovernedTherapeuticAggregatorResult | null> };
export async function getGovernedTherapeuticAggregator(sessionId: string): Promise<GovernedTherapeuticAggregatorResult | null> { return mapGovernedTherapeuticAggregatorEnvelope(await getMedicalCopilotGovernedTherapeuticAggregator(sessionId)); }
export const governedTherapeuticAggregatorReadAdapter: GovernedTherapeuticAggregatorReadAdapter = { get: getGovernedTherapeuticAggregator };
