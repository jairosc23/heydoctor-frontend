import { getMedicalCopilotGovernedCkdGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedCkdGuidelineEngineEnvelope } from "./governed-ckd-guideline-engine-mapper";
import type { GovernedCkdGuidelineEngineResult } from "./governed-ckd-guideline-engine";

export type GovernedCkdGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedCkdGuidelineEngineResult | null>;
};

export async function getGovernedCkdGuidelineEngine(sessionId: string): Promise<GovernedCkdGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedCkdGuidelineEngine(sessionId);
  return mapGovernedCkdGuidelineEngineEnvelope(envelope);
}

export const governedCkdGuidelineEngineReadAdapter: GovernedCkdGuidelineEngineReadAdapter = { get: getGovernedCkdGuidelineEngine };
