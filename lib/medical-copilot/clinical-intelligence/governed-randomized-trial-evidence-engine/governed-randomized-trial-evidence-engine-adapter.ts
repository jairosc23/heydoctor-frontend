import { getMedicalCopilotGovernedRandomizedTrialEvidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedRandomizedTrialEvidenceEngineEnvelope } from "./governed-randomized-trial-evidence-engine-mapper";
import type { GovernedRandomizedTrialEvidenceEngineResult } from "./governed-randomized-trial-evidence-engine";

export type GovernedRandomizedTrialEvidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedRandomizedTrialEvidenceEngineResult | null>;
};

export async function getGovernedRandomizedTrialEvidenceEngine(sessionId: string): Promise<GovernedRandomizedTrialEvidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedRandomizedTrialEvidenceEngine(sessionId);
  return mapGovernedRandomizedTrialEvidenceEngineEnvelope(envelope);
}

export const governedRandomizedTrialEvidenceEngineReadAdapter: GovernedRandomizedTrialEvidenceEngineReadAdapter = {
  get: getGovernedRandomizedTrialEvidenceEngine,
};
