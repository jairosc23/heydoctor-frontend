import { getMedicalCopilotGovernedClinicalContextAggregator } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalContextAggregatorEnvelope } from "./governed-clinical-context-aggregator-mapper";
import type { GovernedClinicalContextAggregatorResult } from "./governed-clinical-context-aggregator";
export type GovernedClinicalContextAggregatorReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalContextAggregatorResult | null> };
export async function getGovernedClinicalContextAggregator(sessionId: string): Promise<GovernedClinicalContextAggregatorResult | null> { return mapGovernedClinicalContextAggregatorEnvelope(await getMedicalCopilotGovernedClinicalContextAggregator(sessionId)); }
export const governedClinicalContextAggregatorReadAdapter: GovernedClinicalContextAggregatorReadAdapter = { get: getGovernedClinicalContextAggregator };
