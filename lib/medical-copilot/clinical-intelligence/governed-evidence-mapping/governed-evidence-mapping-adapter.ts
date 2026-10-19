import { getMedicalCopilotGovernedEvidenceMapping } from "../../api";
import { mapGovernedEvidenceMappingEnvelope } from "./governed-evidence-mapping-mapper";
import type { GovernedEvidenceMappingResult } from "./governed-evidence-mapping";

export async function getGovernedEvidenceMapping(sessionId: string): Promise<GovernedEvidenceMappingResult | null> {
  const envelope = await getMedicalCopilotGovernedEvidenceMapping(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedEvidenceMappingEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedEvidenceMappingReadAdapter = { getGovernedEvidenceMapping: typeof getGovernedEvidenceMapping };
export const governedEvidenceMappingReadAdapter: GovernedEvidenceMappingReadAdapter = { getGovernedEvidenceMapping };
