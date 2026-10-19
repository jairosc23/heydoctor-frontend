import { getMedicalCopilotGovernedAhaGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedAhaGuidelineEngineEnvelope } from "./governed-aha-guideline-engine-mapper";
import type { GovernedAhaGuidelineEngineResult } from "./governed-aha-guideline-engine";

export type GovernedAhaGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedAhaGuidelineEngineResult | null>;
};

export async function getGovernedAhaGuidelineEngine(sessionId: string): Promise<GovernedAhaGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedAhaGuidelineEngine(sessionId);
  return mapGovernedAhaGuidelineEngineEnvelope(envelope);
}

export const governedAhaGuidelineEngineReadAdapter: GovernedAhaGuidelineEngineReadAdapter = { get: getGovernedAhaGuidelineEngine };
