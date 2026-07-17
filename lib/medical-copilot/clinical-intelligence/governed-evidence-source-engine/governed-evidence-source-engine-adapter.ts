import { getMedicalCopilotGovernedEvidenceSourceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedEvidenceSourceEngineEnvelope } from "./governed-evidence-source-engine-mapper";
import type { GovernedEvidenceSourceEngineResult } from "./governed-evidence-source-engine";

export type GovernedEvidenceSourceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedEvidenceSourceEngineResult | null>;
};

export async function getGovernedEvidenceSourceEngine(sessionId: string): Promise<GovernedEvidenceSourceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedEvidenceSourceEngine(sessionId);
  return mapGovernedEvidenceSourceEngineEnvelope(envelope);
}

export const governedEvidenceSourceEngineReadAdapter: GovernedEvidenceSourceEngineReadAdapter = {
  get: getGovernedEvidenceSourceEngine,
};
