import { getMedicalCopilotGovernedExpertConsensusEvidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedExpertConsensusEvidenceEngineEnvelope } from "./governed-expert-consensus-evidence-engine-mapper";
import type { GovernedExpertConsensusEvidenceEngineResult } from "./governed-expert-consensus-evidence-engine";

export type GovernedExpertConsensusEvidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedExpertConsensusEvidenceEngineResult | null>;
};

export async function getGovernedExpertConsensusEvidenceEngine(sessionId: string): Promise<GovernedExpertConsensusEvidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedExpertConsensusEvidenceEngine(sessionId);
  return mapGovernedExpertConsensusEvidenceEngineEnvelope(envelope);
}

export const governedExpertConsensusEvidenceEngineReadAdapter: GovernedExpertConsensusEvidenceEngineReadAdapter = {
  get: getGovernedExpertConsensusEvidenceEngine,
};
