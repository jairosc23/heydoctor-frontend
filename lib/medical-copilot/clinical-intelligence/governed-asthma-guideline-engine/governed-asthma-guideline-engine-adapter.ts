import { getMedicalCopilotGovernedAsthmaGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedAsthmaGuidelineEngineEnvelope } from "./governed-asthma-guideline-engine-mapper";
import type { GovernedAsthmaGuidelineEngineResult } from "./governed-asthma-guideline-engine";

export type GovernedAsthmaGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedAsthmaGuidelineEngineResult | null>;
};

export async function getGovernedAsthmaGuidelineEngine(sessionId: string): Promise<GovernedAsthmaGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedAsthmaGuidelineEngine(sessionId);
  return mapGovernedAsthmaGuidelineEngineEnvelope(envelope);
}

export const governedAsthmaGuidelineEngineReadAdapter: GovernedAsthmaGuidelineEngineReadAdapter = { get: getGovernedAsthmaGuidelineEngine };
