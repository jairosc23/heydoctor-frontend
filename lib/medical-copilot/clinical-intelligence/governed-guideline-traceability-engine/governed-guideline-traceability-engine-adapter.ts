import { getMedicalCopilotGovernedGuidelineTraceabilityEngine } from "@/lib/medical-copilot/api";
import { mapGovernedGuidelineTraceabilityEngineEnvelope } from "./governed-guideline-traceability-engine-mapper";
import type { GovernedGuidelineTraceabilityEngineResult } from "./governed-guideline-traceability-engine";

export type GovernedGuidelineTraceabilityEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedGuidelineTraceabilityEngineResult | null>;
};

export async function getGovernedGuidelineTraceabilityEngine(sessionId: string): Promise<GovernedGuidelineTraceabilityEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedGuidelineTraceabilityEngine(sessionId);
  return mapGovernedGuidelineTraceabilityEngineEnvelope(envelope);
}

export const governedGuidelineTraceabilityEngineReadAdapter: GovernedGuidelineTraceabilityEngineReadAdapter = { get: getGovernedGuidelineTraceabilityEngine };
