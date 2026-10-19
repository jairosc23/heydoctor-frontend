import { getMedicalCopilotGovernedEvidenceHierarchyEngine } from "@/lib/medical-copilot/api";
import { mapGovernedEvidenceHierarchyEngineEnvelope } from "./governed-evidence-hierarchy-engine-mapper";
import type { GovernedEvidenceHierarchyEngineResult } from "./governed-evidence-hierarchy-engine";

export type GovernedEvidenceHierarchyEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedEvidenceHierarchyEngineResult | null>;
};

export async function getGovernedEvidenceHierarchyEngine(sessionId: string): Promise<GovernedEvidenceHierarchyEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedEvidenceHierarchyEngine(sessionId);
  return mapGovernedEvidenceHierarchyEngineEnvelope(envelope);
}

export const governedEvidenceHierarchyEngineReadAdapter: GovernedEvidenceHierarchyEngineReadAdapter = {
  get: getGovernedEvidenceHierarchyEngine,
};
