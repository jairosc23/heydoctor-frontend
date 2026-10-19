import { getMedicalCopilotGovernedClinicalGuidelineEvidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalGuidelineEvidenceEngineEnvelope } from "./governed-clinical-guideline-evidence-engine-mapper";
import type { GovernedClinicalGuidelineEvidenceEngineResult } from "./governed-clinical-guideline-evidence-engine";

export type GovernedClinicalGuidelineEvidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedClinicalGuidelineEvidenceEngineResult | null>;
};

export async function getGovernedClinicalGuidelineEvidenceEngine(sessionId: string): Promise<GovernedClinicalGuidelineEvidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalGuidelineEvidenceEngine(sessionId);
  return mapGovernedClinicalGuidelineEvidenceEngineEnvelope(envelope);
}

export const governedClinicalGuidelineEvidenceEngineReadAdapter: GovernedClinicalGuidelineEvidenceEngineReadAdapter = {
  get: getGovernedClinicalGuidelineEvidenceEngine,
};
