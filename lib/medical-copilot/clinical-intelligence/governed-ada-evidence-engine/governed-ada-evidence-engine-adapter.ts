import { getMedicalCopilotGovernedAdaEvidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedAdaEvidenceEngineEnvelope } from "./governed-ada-evidence-engine-mapper";
import type { GovernedAdaEvidenceEngineResult } from "./governed-ada-evidence-engine";

export type GovernedAdaEvidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedAdaEvidenceEngineResult | null>;
};

export async function getGovernedAdaEvidenceEngine(sessionId: string): Promise<GovernedAdaEvidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedAdaEvidenceEngine(sessionId);
  return mapGovernedAdaEvidenceEngineEnvelope(envelope);
}

export const governedAdaEvidenceEngineReadAdapter: GovernedAdaEvidenceEngineReadAdapter = {
  get: getGovernedAdaEvidenceEngine,
};
