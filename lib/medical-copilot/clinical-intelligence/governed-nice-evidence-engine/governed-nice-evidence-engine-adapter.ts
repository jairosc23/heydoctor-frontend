import { getMedicalCopilotGovernedNiceEvidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedNiceEvidenceEngineEnvelope } from "./governed-nice-evidence-engine-mapper";
import type { GovernedNiceEvidenceEngineResult } from "./governed-nice-evidence-engine";

export type GovernedNiceEvidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedNiceEvidenceEngineResult | null>;
};

export async function getGovernedNiceEvidenceEngine(sessionId: string): Promise<GovernedNiceEvidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedNiceEvidenceEngine(sessionId);
  return mapGovernedNiceEvidenceEngineEnvelope(envelope);
}

export const governedNiceEvidenceEngineReadAdapter: GovernedNiceEvidenceEngineReadAdapter = {
  get: getGovernedNiceEvidenceEngine,
};
