import { getMedicalCopilotGovernedWhoGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedWhoGuidelineEngineEnvelope } from "./governed-who-guideline-engine-mapper";
import type { GovernedWhoGuidelineEngineResult } from "./governed-who-guideline-engine";

export type GovernedWhoGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedWhoGuidelineEngineResult | null>;
};

export async function getGovernedWhoGuidelineEngine(sessionId: string): Promise<GovernedWhoGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedWhoGuidelineEngine(sessionId);
  return mapGovernedWhoGuidelineEngineEnvelope(envelope);
}

export const governedWhoGuidelineEngineReadAdapter: GovernedWhoGuidelineEngineReadAdapter = { get: getGovernedWhoGuidelineEngine };
