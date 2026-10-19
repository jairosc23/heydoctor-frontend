import { getMedicalCopilotGovernedEvidenceAggregator } from "@/lib/medical-copilot/api";
import { mapGovernedEvidenceAggregatorEnvelope } from "./governed-evidence-aggregator-mapper";
import type { GovernedEvidenceAggregatorResult } from "./governed-evidence-aggregator";
export type GovernedEvidenceAggregatorReadAdapter = { get: (sessionId: string) => Promise<GovernedEvidenceAggregatorResult | null> };
export async function getGovernedEvidenceAggregator(sessionId: string): Promise<GovernedEvidenceAggregatorResult | null> { return mapGovernedEvidenceAggregatorEnvelope(await getMedicalCopilotGovernedEvidenceAggregator(sessionId)); }
export const governedEvidenceAggregatorReadAdapter: GovernedEvidenceAggregatorReadAdapter = { get: getGovernedEvidenceAggregator };
