import { getMedicalCopilotGovernedDiagnosticAggregator } from "@/lib/medical-copilot/api";
import { mapGovernedDiagnosticAggregatorEnvelope } from "./governed-diagnostic-aggregator-mapper";
import type { GovernedDiagnosticAggregatorResult } from "./governed-diagnostic-aggregator";
export type GovernedDiagnosticAggregatorReadAdapter = { get: (sessionId: string) => Promise<GovernedDiagnosticAggregatorResult | null> };
export async function getGovernedDiagnosticAggregator(sessionId: string): Promise<GovernedDiagnosticAggregatorResult | null> { return mapGovernedDiagnosticAggregatorEnvelope(await getMedicalCopilotGovernedDiagnosticAggregator(sessionId)); }
export const governedDiagnosticAggregatorReadAdapter: GovernedDiagnosticAggregatorReadAdapter = { get: getGovernedDiagnosticAggregator };
