import { getMedicalCopilotGovernedAhaEvidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedAhaEvidenceEngineEnvelope } from "./governed-aha-evidence-engine-mapper";
import type { GovernedAhaEvidenceEngineResult } from "./governed-aha-evidence-engine";

export type GovernedAhaEvidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedAhaEvidenceEngineResult | null>;
};

export async function getGovernedAhaEvidenceEngine(sessionId: string): Promise<GovernedAhaEvidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedAhaEvidenceEngine(sessionId);
  return mapGovernedAhaEvidenceEngineEnvelope(envelope);
}

export const governedAhaEvidenceEngineReadAdapter: GovernedAhaEvidenceEngineReadAdapter = {
  get: getGovernedAhaEvidenceEngine,
};
