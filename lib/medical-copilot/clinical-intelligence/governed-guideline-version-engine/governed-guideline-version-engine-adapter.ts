import { getMedicalCopilotGovernedGuidelineVersionEngine } from "@/lib/medical-copilot/api";
import { mapGovernedGuidelineVersionEngineEnvelope } from "./governed-guideline-version-engine-mapper";
import type { GovernedGuidelineVersionEngineResult } from "./governed-guideline-version-engine";

export type GovernedGuidelineVersionEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedGuidelineVersionEngineResult | null>;
};

export async function getGovernedGuidelineVersionEngine(sessionId: string): Promise<GovernedGuidelineVersionEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedGuidelineVersionEngine(sessionId);
  return mapGovernedGuidelineVersionEngineEnvelope(envelope);
}

export const governedGuidelineVersionEngineReadAdapter: GovernedGuidelineVersionEngineReadAdapter = { get: getGovernedGuidelineVersionEngine };
