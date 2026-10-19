import { getMedicalCopilotGovernedObservationalStudyEvidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedObservationalStudyEvidenceEngineEnvelope } from "./governed-observational-study-evidence-engine-mapper";
import type { GovernedObservationalStudyEvidenceEngineResult } from "./governed-observational-study-evidence-engine";

export type GovernedObservationalStudyEvidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedObservationalStudyEvidenceEngineResult | null>;
};

export async function getGovernedObservationalStudyEvidenceEngine(sessionId: string): Promise<GovernedObservationalStudyEvidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedObservationalStudyEvidenceEngine(sessionId);
  return mapGovernedObservationalStudyEvidenceEngineEnvelope(envelope);
}

export const governedObservationalStudyEvidenceEngineReadAdapter: GovernedObservationalStudyEvidenceEngineReadAdapter = {
  get: getGovernedObservationalStudyEvidenceEngine,
};
