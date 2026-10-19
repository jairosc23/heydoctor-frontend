import { getMedicalCopilotGovernedImagingKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedImagingKnowledgeEngineEnvelope } from "./governed-imaging-knowledge-engine-mapper";
import type { GovernedImagingKnowledgeEngineResult } from "./governed-imaging-knowledge-engine";

export type GovernedImagingKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedImagingKnowledgeEngineResult | null>;
};

export async function getGovernedImagingKnowledgeEngine(sessionId: string): Promise<GovernedImagingKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedImagingKnowledgeEngine(sessionId);
  return mapGovernedImagingKnowledgeEngineEnvelope(envelope);
}

export const governedImagingKnowledgeEngineReadAdapter: GovernedImagingKnowledgeEngineReadAdapter = {
  get: getGovernedImagingKnowledgeEngine,
};
