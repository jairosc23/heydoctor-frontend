import { getMedicalCopilotGovernedAdaGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedAdaGuidelineEngineEnvelope } from "./governed-ada-guideline-engine-mapper";
import type { GovernedAdaGuidelineEngineResult } from "./governed-ada-guideline-engine";

export type GovernedAdaGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedAdaGuidelineEngineResult | null>;
};

export async function getGovernedAdaGuidelineEngine(sessionId: string): Promise<GovernedAdaGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedAdaGuidelineEngine(sessionId);
  return mapGovernedAdaGuidelineEngineEnvelope(envelope);
}

export const governedAdaGuidelineEngineReadAdapter: GovernedAdaGuidelineEngineReadAdapter = { get: getGovernedAdaGuidelineEngine };
