import { getMedicalCopilotGovernedEvidenceTrace } from "../../api";
import { mapGovernedEvidenceTraceEnvelope } from "./governed-evidence-trace-mapper";
import type { GovernedEvidenceTraceResult } from "./governed-evidence-trace";

export async function getGovernedEvidenceTrace(sessionId: string): Promise<GovernedEvidenceTraceResult | null> {
  const envelope = await getMedicalCopilotGovernedEvidenceTrace(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedEvidenceTraceEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedEvidenceTraceReadAdapter = { getGovernedEvidenceTrace: typeof getGovernedEvidenceTrace };
export const governedEvidenceTraceReadAdapter: GovernedEvidenceTraceReadAdapter = { getGovernedEvidenceTrace };
