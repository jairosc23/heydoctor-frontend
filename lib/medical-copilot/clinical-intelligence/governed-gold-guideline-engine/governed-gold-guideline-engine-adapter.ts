import { getMedicalCopilotGovernedGoldGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedGoldGuidelineEngineEnvelope } from "./governed-gold-guideline-engine-mapper";
import type { GovernedGoldGuidelineEngineResult } from "./governed-gold-guideline-engine";

export type GovernedGoldGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedGoldGuidelineEngineResult | null>;
};

export async function getGovernedGoldGuidelineEngine(sessionId: string): Promise<GovernedGoldGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedGoldGuidelineEngine(sessionId);
  return mapGovernedGoldGuidelineEngineEnvelope(envelope);
}

export const governedGoldGuidelineEngineReadAdapter: GovernedGoldGuidelineEngineReadAdapter = { get: getGovernedGoldGuidelineEngine };
