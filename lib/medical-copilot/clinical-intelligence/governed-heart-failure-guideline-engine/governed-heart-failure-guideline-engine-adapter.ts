import { getMedicalCopilotGovernedHeartFailureGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedHeartFailureGuidelineEngineEnvelope } from "./governed-heart-failure-guideline-engine-mapper";
import type { GovernedHeartFailureGuidelineEngineResult } from "./governed-heart-failure-guideline-engine";

export type GovernedHeartFailureGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedHeartFailureGuidelineEngineResult | null>;
};

export async function getGovernedHeartFailureGuidelineEngine(sessionId: string): Promise<GovernedHeartFailureGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedHeartFailureGuidelineEngine(sessionId);
  return mapGovernedHeartFailureGuidelineEngineEnvelope(envelope);
}

export const governedHeartFailureGuidelineEngineReadAdapter: GovernedHeartFailureGuidelineEngineReadAdapter = { get: getGovernedHeartFailureGuidelineEngine };
