import { getMedicalCopilotGovernedClinicalIntelligenceAggregator } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalIntelligenceAggregatorEnvelope } from "./governed-clinical-intelligence-aggregator-mapper";
import type { GovernedClinicalIntelligenceAggregatorResult } from "./governed-clinical-intelligence-aggregator";
export type GovernedClinicalIntelligenceAggregatorReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalIntelligenceAggregatorResult | null> };
export async function getGovernedClinicalIntelligenceAggregator(sessionId: string): Promise<GovernedClinicalIntelligenceAggregatorResult | null> { return mapGovernedClinicalIntelligenceAggregatorEnvelope(await getMedicalCopilotGovernedClinicalIntelligenceAggregator(sessionId)); }
export const governedClinicalIntelligenceAggregatorReadAdapter: GovernedClinicalIntelligenceAggregatorReadAdapter = { get: getGovernedClinicalIntelligenceAggregator };
