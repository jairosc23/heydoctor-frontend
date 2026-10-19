import { getMedicalCopilotGovernedEvidenceConfidence } from "../../api";
import { mapGovernedEvidenceConfidenceEnvelope } from "./governed-evidence-confidence-mapper";
import type { GovernedEvidenceConfidenceResult } from "./governed-evidence-confidence";

export async function getGovernedEvidenceConfidence(sessionId: string): Promise<GovernedEvidenceConfidenceResult | null> {
  const envelope = await getMedicalCopilotGovernedEvidenceConfidence(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedEvidenceConfidenceEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedEvidenceConfidenceReadAdapter = { getGovernedEvidenceConfidence: typeof getGovernedEvidenceConfidence };
export const governedEvidenceConfidenceReadAdapter: GovernedEvidenceConfidenceReadAdapter = { getGovernedEvidenceConfidence };
