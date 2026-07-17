import { getMedicalCopilotGovernedUspstfEvidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedUspstfEvidenceEngineEnvelope } from "./governed-uspstf-evidence-engine-mapper";
import type { GovernedUspstfEvidenceEngineResult } from "./governed-uspstf-evidence-engine";

export type GovernedUspstfEvidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedUspstfEvidenceEngineResult | null>;
};

export async function getGovernedUspstfEvidenceEngine(sessionId: string): Promise<GovernedUspstfEvidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedUspstfEvidenceEngine(sessionId);
  return mapGovernedUspstfEvidenceEngineEnvelope(envelope);
}

export const governedUspstfEvidenceEngineReadAdapter: GovernedUspstfEvidenceEngineReadAdapter = {
  get: getGovernedUspstfEvidenceEngine,
};
