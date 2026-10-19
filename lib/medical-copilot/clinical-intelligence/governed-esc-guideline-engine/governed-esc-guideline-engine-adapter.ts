import { getMedicalCopilotGovernedEscGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedEscGuidelineEngineEnvelope } from "./governed-esc-guideline-engine-mapper";
import type { GovernedEscGuidelineEngineResult } from "./governed-esc-guideline-engine";

export type GovernedEscGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedEscGuidelineEngineResult | null>;
};

export async function getGovernedEscGuidelineEngine(sessionId: string): Promise<GovernedEscGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedEscGuidelineEngine(sessionId);
  return mapGovernedEscGuidelineEngineEnvelope(envelope);
}

export const governedEscGuidelineEngineReadAdapter: GovernedEscGuidelineEngineReadAdapter = { get: getGovernedEscGuidelineEngine };
