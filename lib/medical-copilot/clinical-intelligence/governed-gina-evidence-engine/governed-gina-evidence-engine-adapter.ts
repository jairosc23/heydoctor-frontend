import { getMedicalCopilotGovernedGinaEvidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedGinaEvidenceEngineEnvelope } from "./governed-gina-evidence-engine-mapper";
import type { GovernedGinaEvidenceEngineResult } from "./governed-gina-evidence-engine";

export type GovernedGinaEvidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedGinaEvidenceEngineResult | null>;
};

export async function getGovernedGinaEvidenceEngine(sessionId: string): Promise<GovernedGinaEvidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedGinaEvidenceEngine(sessionId);
  return mapGovernedGinaEvidenceEngineEnvelope(envelope);
}

export const governedGinaEvidenceEngineReadAdapter: GovernedGinaEvidenceEngineReadAdapter = {
  get: getGovernedGinaEvidenceEngine,
};
