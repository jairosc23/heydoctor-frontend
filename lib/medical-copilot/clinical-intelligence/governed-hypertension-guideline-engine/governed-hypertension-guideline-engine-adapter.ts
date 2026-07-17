import { getMedicalCopilotGovernedHypertensionGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedHypertensionGuidelineEngineEnvelope } from "./governed-hypertension-guideline-engine-mapper";
import type { GovernedHypertensionGuidelineEngineResult } from "./governed-hypertension-guideline-engine";

export type GovernedHypertensionGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedHypertensionGuidelineEngineResult | null>;
};

export async function getGovernedHypertensionGuidelineEngine(sessionId: string): Promise<GovernedHypertensionGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedHypertensionGuidelineEngine(sessionId);
  return mapGovernedHypertensionGuidelineEngineEnvelope(envelope);
}

export const governedHypertensionGuidelineEngineReadAdapter: GovernedHypertensionGuidelineEngineReadAdapter = { get: getGovernedHypertensionGuidelineEngine };
