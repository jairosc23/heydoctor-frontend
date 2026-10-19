import { getMedicalCopilotGovernedAscoGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedAscoGuidelineEngineEnvelope } from "./governed-asco-guideline-engine-mapper";
import type { GovernedAscoGuidelineEngineResult } from "./governed-asco-guideline-engine";

export type GovernedAscoGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedAscoGuidelineEngineResult | null>;
};

export async function getGovernedAscoGuidelineEngine(sessionId: string): Promise<GovernedAscoGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedAscoGuidelineEngine(sessionId);
  return mapGovernedAscoGuidelineEngineEnvelope(envelope);
}

export const governedAscoGuidelineEngineReadAdapter: GovernedAscoGuidelineEngineReadAdapter = { get: getGovernedAscoGuidelineEngine };
