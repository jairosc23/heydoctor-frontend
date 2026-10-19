import { getMedicalCopilotGovernedEvidenceConfidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedEvidenceConfidenceEngineEnvelope } from "./governed-evidence-confidence-engine-mapper";
import type { GovernedEvidenceConfidenceEngineResult } from "./governed-evidence-confidence-engine";

export type GovernedEvidenceConfidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedEvidenceConfidenceEngineResult | null>;
};

export async function getGovernedEvidenceConfidenceEngine(sessionId: string): Promise<GovernedEvidenceConfidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedEvidenceConfidenceEngine(sessionId);
  return mapGovernedEvidenceConfidenceEngineEnvelope(envelope);
}

export const governedEvidenceConfidenceEngineReadAdapter: GovernedEvidenceConfidenceEngineReadAdapter = {
  get: getGovernedEvidenceConfidenceEngine,
};
