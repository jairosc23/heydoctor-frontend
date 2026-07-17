import { getMedicalCopilotGovernedDiagnosticCriteriaKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiagnosticCriteriaKnowledgeEngineEnvelope } from "./governed-diagnostic-criteria-knowledge-engine-mapper";
import type { GovernedDiagnosticCriteriaKnowledgeEngineResult } from "./governed-diagnostic-criteria-knowledge-engine";

export type GovernedDiagnosticCriteriaKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedDiagnosticCriteriaKnowledgeEngineResult | null>;
};

export async function getGovernedDiagnosticCriteriaKnowledgeEngine(sessionId: string): Promise<GovernedDiagnosticCriteriaKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedDiagnosticCriteriaKnowledgeEngine(sessionId);
  return mapGovernedDiagnosticCriteriaKnowledgeEngineEnvelope(envelope);
}

export const governedDiagnosticCriteriaKnowledgeEngineReadAdapter: GovernedDiagnosticCriteriaKnowledgeEngineReadAdapter = {
  get: getGovernedDiagnosticCriteriaKnowledgeEngine,
};
