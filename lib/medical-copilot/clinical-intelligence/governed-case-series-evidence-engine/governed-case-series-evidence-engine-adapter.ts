import { getMedicalCopilotGovernedCaseSeriesEvidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedCaseSeriesEvidenceEngineEnvelope } from "./governed-case-series-evidence-engine-mapper";
import type { GovernedCaseSeriesEvidenceEngineResult } from "./governed-case-series-evidence-engine";

export type GovernedCaseSeriesEvidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedCaseSeriesEvidenceEngineResult | null>;
};

export async function getGovernedCaseSeriesEvidenceEngine(sessionId: string): Promise<GovernedCaseSeriesEvidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedCaseSeriesEvidenceEngine(sessionId);
  return mapGovernedCaseSeriesEvidenceEngineEnvelope(envelope);
}

export const governedCaseSeriesEvidenceEngineReadAdapter: GovernedCaseSeriesEvidenceEngineReadAdapter = {
  get: getGovernedCaseSeriesEvidenceEngine,
};
