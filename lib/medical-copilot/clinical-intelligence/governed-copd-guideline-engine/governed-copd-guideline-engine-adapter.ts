import { getMedicalCopilotGovernedCopdGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedCopdGuidelineEngineEnvelope } from "./governed-copd-guideline-engine-mapper";
import type { GovernedCopdGuidelineEngineResult } from "./governed-copd-guideline-engine";

export type GovernedCopdGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedCopdGuidelineEngineResult | null>;
};

export async function getGovernedCopdGuidelineEngine(sessionId: string): Promise<GovernedCopdGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedCopdGuidelineEngine(sessionId);
  return mapGovernedCopdGuidelineEngineEnvelope(envelope);
}

export const governedCopdGuidelineEngineReadAdapter: GovernedCopdGuidelineEngineReadAdapter = { get: getGovernedCopdGuidelineEngine };
