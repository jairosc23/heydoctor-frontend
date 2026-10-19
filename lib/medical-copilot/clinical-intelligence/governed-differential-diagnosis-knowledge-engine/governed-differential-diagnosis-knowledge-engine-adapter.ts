import { getMedicalCopilotGovernedDifferentialDiagnosisKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDifferentialDiagnosisKnowledgeEngineEnvelope } from "./governed-differential-diagnosis-knowledge-engine-mapper";
import type { GovernedDifferentialDiagnosisKnowledgeEngineResult } from "./governed-differential-diagnosis-knowledge-engine";

export type GovernedDifferentialDiagnosisKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedDifferentialDiagnosisKnowledgeEngineResult | null>;
};

export async function getGovernedDifferentialDiagnosisKnowledgeEngine(sessionId: string): Promise<GovernedDifferentialDiagnosisKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedDifferentialDiagnosisKnowledgeEngine(sessionId);
  return mapGovernedDifferentialDiagnosisKnowledgeEngineEnvelope(envelope);
}

export const governedDifferentialDiagnosisKnowledgeEngineReadAdapter: GovernedDifferentialDiagnosisKnowledgeEngineReadAdapter = {
  get: getGovernedDifferentialDiagnosisKnowledgeEngine,
};
