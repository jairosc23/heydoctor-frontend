import { getMedicalCopilotGovernedEscEvidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedEscEvidenceEngineEnvelope } from "./governed-esc-evidence-engine-mapper";
import type { GovernedEscEvidenceEngineResult } from "./governed-esc-evidence-engine";

export type GovernedEscEvidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedEscEvidenceEngineResult | null>;
};

export async function getGovernedEscEvidenceEngine(sessionId: string): Promise<GovernedEscEvidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedEscEvidenceEngine(sessionId);
  return mapGovernedEscEvidenceEngineEnvelope(envelope);
}

export const governedEscEvidenceEngineReadAdapter: GovernedEscEvidenceEngineReadAdapter = {
  get: getGovernedEscEvidenceEngine,
};
