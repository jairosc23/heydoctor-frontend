import { getMedicalCopilotGovernedKdigoEvidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedKdigoEvidenceEngineEnvelope } from "./governed-kdigo-evidence-engine-mapper";
import type { GovernedKdigoEvidenceEngineResult } from "./governed-kdigo-evidence-engine";

export type GovernedKdigoEvidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedKdigoEvidenceEngineResult | null>;
};

export async function getGovernedKdigoEvidenceEngine(sessionId: string): Promise<GovernedKdigoEvidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedKdigoEvidenceEngine(sessionId);
  return mapGovernedKdigoEvidenceEngineEnvelope(envelope);
}

export const governedKdigoEvidenceEngineReadAdapter: GovernedKdigoEvidenceEngineReadAdapter = {
  get: getGovernedKdigoEvidenceEngine,
};
