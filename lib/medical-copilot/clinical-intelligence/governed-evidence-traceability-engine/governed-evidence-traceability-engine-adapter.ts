import { getMedicalCopilotGovernedEvidenceTraceabilityEngine } from "@/lib/medical-copilot/api";
import { mapGovernedEvidenceTraceabilityEngineEnvelope } from "./governed-evidence-traceability-engine-mapper";
import type { GovernedEvidenceTraceabilityEngineResult } from "./governed-evidence-traceability-engine";

export type GovernedEvidenceTraceabilityEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedEvidenceTraceabilityEngineResult | null>;
};

export async function getGovernedEvidenceTraceabilityEngine(sessionId: string): Promise<GovernedEvidenceTraceabilityEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedEvidenceTraceabilityEngine(sessionId);
  return mapGovernedEvidenceTraceabilityEngineEnvelope(envelope);
}

export const governedEvidenceTraceabilityEngineReadAdapter: GovernedEvidenceTraceabilityEngineReadAdapter = {
  get: getGovernedEvidenceTraceabilityEngine,
};
