import { getMedicalCopilotGovernedAuditAggregator } from "@/lib/medical-copilot/api";
import { mapGovernedAuditAggregatorEnvelope } from "./governed-audit-aggregator-mapper";
import type { GovernedAuditAggregatorResult } from "./governed-audit-aggregator";
export type GovernedAuditAggregatorReadAdapter = { get: (sessionId: string) => Promise<GovernedAuditAggregatorResult | null> };
export async function getGovernedAuditAggregator(sessionId: string): Promise<GovernedAuditAggregatorResult | null> { return mapGovernedAuditAggregatorEnvelope(await getMedicalCopilotGovernedAuditAggregator(sessionId)); }
export const governedAuditAggregatorReadAdapter: GovernedAuditAggregatorReadAdapter = { get: getGovernedAuditAggregator };
