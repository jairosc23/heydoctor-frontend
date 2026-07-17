import { getMedicalCopilotGovernedGuidelineAggregator } from "@/lib/medical-copilot/api";
import { mapGovernedGuidelineAggregatorEnvelope } from "./governed-guideline-aggregator-mapper";
import type { GovernedGuidelineAggregatorResult } from "./governed-guideline-aggregator";
export type GovernedGuidelineAggregatorReadAdapter = { get: (sessionId: string) => Promise<GovernedGuidelineAggregatorResult | null> };
export async function getGovernedGuidelineAggregator(sessionId: string): Promise<GovernedGuidelineAggregatorResult | null> { return mapGovernedGuidelineAggregatorEnvelope(await getMedicalCopilotGovernedGuidelineAggregator(sessionId)); }
export const governedGuidelineAggregatorReadAdapter: GovernedGuidelineAggregatorReadAdapter = { get: getGovernedGuidelineAggregator };
