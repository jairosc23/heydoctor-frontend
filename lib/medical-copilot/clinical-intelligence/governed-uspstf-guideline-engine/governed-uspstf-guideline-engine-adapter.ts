import { getMedicalCopilotGovernedUspstfGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedUspstfGuidelineEngineEnvelope } from "./governed-uspstf-guideline-engine-mapper";
import type { GovernedUspstfGuidelineEngineResult } from "./governed-uspstf-guideline-engine";

export type GovernedUspstfGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedUspstfGuidelineEngineResult | null>;
};

export async function getGovernedUspstfGuidelineEngine(sessionId: string): Promise<GovernedUspstfGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedUspstfGuidelineEngine(sessionId);
  return mapGovernedUspstfGuidelineEngineEnvelope(envelope);
}

export const governedUspstfGuidelineEngineReadAdapter: GovernedUspstfGuidelineEngineReadAdapter = { get: getGovernedUspstfGuidelineEngine };
