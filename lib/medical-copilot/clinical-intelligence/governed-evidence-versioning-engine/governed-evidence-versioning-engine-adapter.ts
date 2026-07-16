import { getMedicalCopilotGovernedEvidenceVersioningEngine } from "@/lib/medical-copilot/api";
import { mapGovernedEvidenceVersioningEngineEnvelope } from "./governed-evidence-versioning-engine-mapper";
import type { GovernedEvidenceVersioningEngineResult } from "./governed-evidence-versioning-engine";

export type GovernedEvidenceVersioningEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedEvidenceVersioningEngineResult | null>;
};

export async function getGovernedEvidenceVersioningEngine(sessionId: string): Promise<GovernedEvidenceVersioningEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedEvidenceVersioningEngine(sessionId);
  return mapGovernedEvidenceVersioningEngineEnvelope(envelope);
}

export const governedEvidenceVersioningEngineReadAdapter: GovernedEvidenceVersioningEngineReadAdapter = {
  get: getGovernedEvidenceVersioningEngine,
};
