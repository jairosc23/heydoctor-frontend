import { getMedicalCopilotGovernedNiceGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedNiceGuidelineEngineEnvelope } from "./governed-nice-guideline-engine-mapper";
import type { GovernedNiceGuidelineEngineResult } from "./governed-nice-guideline-engine";

export type GovernedNiceGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedNiceGuidelineEngineResult | null>;
};

export async function getGovernedNiceGuidelineEngine(sessionId: string): Promise<GovernedNiceGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedNiceGuidelineEngine(sessionId);
  return mapGovernedNiceGuidelineEngineEnvelope(envelope);
}

export const governedNiceGuidelineEngineReadAdapter: GovernedNiceGuidelineEngineReadAdapter = { get: getGovernedNiceGuidelineEngine };
