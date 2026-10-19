import { getMedicalCopilotGovernedEvidenceProvenanceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedEvidenceProvenanceEngineEnvelope } from "./governed-evidence-provenance-engine-mapper";
import type { GovernedEvidenceProvenanceEngineResult } from "./governed-evidence-provenance-engine";

export type GovernedEvidenceProvenanceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedEvidenceProvenanceEngineResult | null>;
};

export async function getGovernedEvidenceProvenanceEngine(sessionId: string): Promise<GovernedEvidenceProvenanceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedEvidenceProvenanceEngine(sessionId);
  return mapGovernedEvidenceProvenanceEngineEnvelope(envelope);
}

export const governedEvidenceProvenanceEngineReadAdapter: GovernedEvidenceProvenanceEngineReadAdapter = {
  get: getGovernedEvidenceProvenanceEngine,
};
