import { getMedicalCopilotGovernedEvidenceLevelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedEvidenceLevelEngineEnvelope } from "./governed-evidence-level-engine-mapper";
import type { GovernedEvidenceLevelEngineResult } from "./governed-evidence-level-engine";

export type GovernedEvidenceLevelEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedEvidenceLevelEngineResult | null>;
};

export async function getGovernedEvidenceLevelEngine(sessionId: string): Promise<GovernedEvidenceLevelEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedEvidenceLevelEngine(sessionId);
  return mapGovernedEvidenceLevelEngineEnvelope(envelope);
}

export const governedEvidenceLevelEngineReadAdapter: GovernedEvidenceLevelEngineReadAdapter = {
  get: getGovernedEvidenceLevelEngine,
};
