import { getMedicalCopilotGovernedCdcEvidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedCdcEvidenceEngineEnvelope } from "./governed-cdc-evidence-engine-mapper";
import type { GovernedCdcEvidenceEngineResult } from "./governed-cdc-evidence-engine";

export type GovernedCdcEvidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedCdcEvidenceEngineResult | null>;
};

export async function getGovernedCdcEvidenceEngine(sessionId: string): Promise<GovernedCdcEvidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedCdcEvidenceEngine(sessionId);
  return mapGovernedCdcEvidenceEngineEnvelope(envelope);
}

export const governedCdcEvidenceEngineReadAdapter: GovernedCdcEvidenceEngineReadAdapter = {
  get: getGovernedCdcEvidenceEngine,
};
