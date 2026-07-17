import { getMedicalCopilotGovernedWhoEvidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedWhoEvidenceEngineEnvelope } from "./governed-who-evidence-engine-mapper";
import type { GovernedWhoEvidenceEngineResult } from "./governed-who-evidence-engine";

export type GovernedWhoEvidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedWhoEvidenceEngineResult | null>;
};

export async function getGovernedWhoEvidenceEngine(sessionId: string): Promise<GovernedWhoEvidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedWhoEvidenceEngine(sessionId);
  return mapGovernedWhoEvidenceEngineEnvelope(envelope);
}

export const governedWhoEvidenceEngineReadAdapter: GovernedWhoEvidenceEngineReadAdapter = {
  get: getGovernedWhoEvidenceEngine,
};
