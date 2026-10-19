import { getMedicalCopilotGovernedGinaGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedGinaGuidelineEngineEnvelope } from "./governed-gina-guideline-engine-mapper";
import type { GovernedGinaGuidelineEngineResult } from "./governed-gina-guideline-engine";

export type GovernedGinaGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedGinaGuidelineEngineResult | null>;
};

export async function getGovernedGinaGuidelineEngine(sessionId: string): Promise<GovernedGinaGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedGinaGuidelineEngine(sessionId);
  return mapGovernedGinaGuidelineEngineEnvelope(envelope);
}

export const governedGinaGuidelineEngineReadAdapter: GovernedGinaGuidelineEngineReadAdapter = { get: getGovernedGinaGuidelineEngine };
