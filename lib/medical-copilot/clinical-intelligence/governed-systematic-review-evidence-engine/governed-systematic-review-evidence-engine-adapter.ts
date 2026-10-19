import { getMedicalCopilotGovernedSystematicReviewEvidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedSystematicReviewEvidenceEngineEnvelope } from "./governed-systematic-review-evidence-engine-mapper";
import type { GovernedSystematicReviewEvidenceEngineResult } from "./governed-systematic-review-evidence-engine";

export type GovernedSystematicReviewEvidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedSystematicReviewEvidenceEngineResult | null>;
};

export async function getGovernedSystematicReviewEvidenceEngine(sessionId: string): Promise<GovernedSystematicReviewEvidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedSystematicReviewEvidenceEngine(sessionId);
  return mapGovernedSystematicReviewEvidenceEngineEnvelope(envelope);
}

export const governedSystematicReviewEvidenceEngineReadAdapter: GovernedSystematicReviewEvidenceEngineReadAdapter = {
  get: getGovernedSystematicReviewEvidenceEngine,
};
