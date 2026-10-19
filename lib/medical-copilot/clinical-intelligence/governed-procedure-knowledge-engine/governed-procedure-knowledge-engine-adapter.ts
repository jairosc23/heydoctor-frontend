import { getMedicalCopilotGovernedProcedureKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedProcedureKnowledgeEngineEnvelope } from "./governed-procedure-knowledge-engine-mapper";
import type { GovernedProcedureKnowledgeEngineResult } from "./governed-procedure-knowledge-engine";

export type GovernedProcedureKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedProcedureKnowledgeEngineResult | null>;
};

export async function getGovernedProcedureKnowledgeEngine(sessionId: string): Promise<GovernedProcedureKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedProcedureKnowledgeEngine(sessionId);
  return mapGovernedProcedureKnowledgeEngineEnvelope(envelope);
}

export const governedProcedureKnowledgeEngineReadAdapter: GovernedProcedureKnowledgeEngineReadAdapter = {
  get: getGovernedProcedureKnowledgeEngine,
};
