import { getMedicalCopilotGovernedIdsaGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedIdsaGuidelineEngineEnvelope } from "./governed-idsa-guideline-engine-mapper";
import type { GovernedIdsaGuidelineEngineResult } from "./governed-idsa-guideline-engine";

export type GovernedIdsaGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedIdsaGuidelineEngineResult | null>;
};

export async function getGovernedIdsaGuidelineEngine(sessionId: string): Promise<GovernedIdsaGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedIdsaGuidelineEngine(sessionId);
  return mapGovernedIdsaGuidelineEngineEnvelope(envelope);
}

export const governedIdsaGuidelineEngineReadAdapter: GovernedIdsaGuidelineEngineReadAdapter = { get: getGovernedIdsaGuidelineEngine };
