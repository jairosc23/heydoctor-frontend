import { getMedicalCopilotEvidenceMappingFoundation } from "../../api";
import { mapEvidenceMappingFoundationEnvelope } from "./evidence-mapping-foundation-mapper";
import type { EvidenceMappingFoundationBuilderResult } from "./evidence-mapping-foundation";

export async function getEvidenceMappingFoundation(sessionId: string): Promise<EvidenceMappingFoundationBuilderResult | null> {
  const envelope = await getMedicalCopilotEvidenceMappingFoundation(sessionId);
  return mapEvidenceMappingFoundationEnvelope(envelope.data ?? envelope);
}

export type EvidenceMappingFoundationReadAdapter = { getEvidenceMappingFoundation: typeof getEvidenceMappingFoundation };
export const evidenceMappingReadAdapter: EvidenceMappingFoundationReadAdapter = { getEvidenceMappingFoundation };
