import { getMedicalCopilotGovernedGuidelineRuntimeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedGuidelineRuntimeEngineEnvelope } from "./governed-guideline-runtime-engine-mapper";
import type { GovernedGuidelineRuntimeEngineResult } from "./governed-guideline-runtime-engine";

export type GovernedGuidelineRuntimeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedGuidelineRuntimeEngineResult | null>;
};

export async function getGovernedGuidelineRuntimeEngine(sessionId: string): Promise<GovernedGuidelineRuntimeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedGuidelineRuntimeEngine(sessionId);
  return mapGovernedGuidelineRuntimeEngineEnvelope(envelope);
}

export const governedGuidelineRuntimeEngineReadAdapter: GovernedGuidelineRuntimeEngineReadAdapter = { get: getGovernedGuidelineRuntimeEngine };
