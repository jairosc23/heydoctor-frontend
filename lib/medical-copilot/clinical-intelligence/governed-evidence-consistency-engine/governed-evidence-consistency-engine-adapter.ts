import { getMedicalCopilotGovernedEvidenceConsistencyEngine } from "@/lib/medical-copilot/api";
import { mapGovernedEvidenceConsistencyEngineEnvelope } from "./governed-evidence-consistency-engine-mapper";
import type { GovernedEvidenceConsistencyEngineResult } from "./governed-evidence-consistency-engine";

export type GovernedEvidenceConsistencyEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedEvidenceConsistencyEngineResult | null>;
};

export async function getGovernedEvidenceConsistencyEngine(sessionId: string): Promise<GovernedEvidenceConsistencyEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedEvidenceConsistencyEngine(sessionId);
  return mapGovernedEvidenceConsistencyEngineEnvelope(envelope);
}

export const governedEvidenceConsistencyEngineReadAdapter: GovernedEvidenceConsistencyEngineReadAdapter = {
  get: getGovernedEvidenceConsistencyEngine,
};
