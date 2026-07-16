import { getMedicalCopilotGovernedPreventiveGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedPreventiveGuidelineEngineEnvelope } from "./governed-preventive-guideline-engine-mapper";
import type { GovernedPreventiveGuidelineEngineResult } from "./governed-preventive-guideline-engine";

export type GovernedPreventiveGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedPreventiveGuidelineEngineResult | null>;
};

export async function getGovernedPreventiveGuidelineEngine(sessionId: string): Promise<GovernedPreventiveGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedPreventiveGuidelineEngine(sessionId);
  return mapGovernedPreventiveGuidelineEngineEnvelope(envelope);
}

export const governedPreventiveGuidelineEngineReadAdapter: GovernedPreventiveGuidelineEngineReadAdapter = { get: getGovernedPreventiveGuidelineEngine };
