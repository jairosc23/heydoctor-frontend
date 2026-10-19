import { getMedicalCopilotGovernedKnowledgeAggregator } from "@/lib/medical-copilot/api";
import { mapGovernedKnowledgeAggregatorEnvelope } from "./governed-knowledge-aggregator-mapper";
import type { GovernedKnowledgeAggregatorResult } from "./governed-knowledge-aggregator";
export type GovernedKnowledgeAggregatorReadAdapter = { get: (sessionId: string) => Promise<GovernedKnowledgeAggregatorResult | null> };
export async function getGovernedKnowledgeAggregator(sessionId: string): Promise<GovernedKnowledgeAggregatorResult | null> { return mapGovernedKnowledgeAggregatorEnvelope(await getMedicalCopilotGovernedKnowledgeAggregator(sessionId)); }
export const governedKnowledgeAggregatorReadAdapter: GovernedKnowledgeAggregatorReadAdapter = { get: getGovernedKnowledgeAggregator };
