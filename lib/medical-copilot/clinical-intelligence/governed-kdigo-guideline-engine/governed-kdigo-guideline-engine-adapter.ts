import { getMedicalCopilotGovernedKdigoGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedKdigoGuidelineEngineEnvelope } from "./governed-kdigo-guideline-engine-mapper";
import type { GovernedKdigoGuidelineEngineResult } from "./governed-kdigo-guideline-engine";

export type GovernedKdigoGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedKdigoGuidelineEngineResult | null>;
};

export async function getGovernedKdigoGuidelineEngine(sessionId: string): Promise<GovernedKdigoGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedKdigoGuidelineEngine(sessionId);
  return mapGovernedKdigoGuidelineEngineEnvelope(envelope);
}

export const governedKdigoGuidelineEngineReadAdapter: GovernedKdigoGuidelineEngineReadAdapter = { get: getGovernedKdigoGuidelineEngine };
