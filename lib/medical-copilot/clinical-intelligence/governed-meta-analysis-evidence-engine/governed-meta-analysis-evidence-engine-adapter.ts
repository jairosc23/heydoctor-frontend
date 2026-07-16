import { getMedicalCopilotGovernedMetaAnalysisEvidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedMetaAnalysisEvidenceEngineEnvelope } from "./governed-meta-analysis-evidence-engine-mapper";
import type { GovernedMetaAnalysisEvidenceEngineResult } from "./governed-meta-analysis-evidence-engine";

export type GovernedMetaAnalysisEvidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedMetaAnalysisEvidenceEngineResult | null>;
};

export async function getGovernedMetaAnalysisEvidenceEngine(sessionId: string): Promise<GovernedMetaAnalysisEvidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedMetaAnalysisEvidenceEngine(sessionId);
  return mapGovernedMetaAnalysisEvidenceEngineEnvelope(envelope);
}

export const governedMetaAnalysisEvidenceEngineReadAdapter: GovernedMetaAnalysisEvidenceEngineReadAdapter = {
  get: getGovernedMetaAnalysisEvidenceEngine,
};
