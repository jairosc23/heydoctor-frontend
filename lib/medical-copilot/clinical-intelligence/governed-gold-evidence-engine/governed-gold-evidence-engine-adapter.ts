import { getMedicalCopilotGovernedGoldEvidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedGoldEvidenceEngineEnvelope } from "./governed-gold-evidence-engine-mapper";
import type { GovernedGoldEvidenceEngineResult } from "./governed-gold-evidence-engine";

export type GovernedGoldEvidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedGoldEvidenceEngineResult | null>;
};

export async function getGovernedGoldEvidenceEngine(sessionId: string): Promise<GovernedGoldEvidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedGoldEvidenceEngine(sessionId);
  return mapGovernedGoldEvidenceEngineEnvelope(envelope);
}

export const governedGoldEvidenceEngineReadAdapter: GovernedGoldEvidenceEngineReadAdapter = {
  get: getGovernedGoldEvidenceEngine,
};
