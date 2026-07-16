import { getMedicalCopilotGovernedAapGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedAapGuidelineEngineEnvelope } from "./governed-aap-guideline-engine-mapper";
import type { GovernedAapGuidelineEngineResult } from "./governed-aap-guideline-engine";

export type GovernedAapGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedAapGuidelineEngineResult | null>;
};

export async function getGovernedAapGuidelineEngine(sessionId: string): Promise<GovernedAapGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedAapGuidelineEngine(sessionId);
  return mapGovernedAapGuidelineEngineEnvelope(envelope);
}

export const governedAapGuidelineEngineReadAdapter: GovernedAapGuidelineEngineReadAdapter = { get: getGovernedAapGuidelineEngine };
