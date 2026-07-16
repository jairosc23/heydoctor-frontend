import { getMedicalCopilotGovernedCdcGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedCdcGuidelineEngineEnvelope } from "./governed-cdc-guideline-engine-mapper";
import type { GovernedCdcGuidelineEngineResult } from "./governed-cdc-guideline-engine";

export type GovernedCdcGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedCdcGuidelineEngineResult | null>;
};

export async function getGovernedCdcGuidelineEngine(sessionId: string): Promise<GovernedCdcGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedCdcGuidelineEngine(sessionId);
  return mapGovernedCdcGuidelineEngineEnvelope(envelope);
}

export const governedCdcGuidelineEngineReadAdapter: GovernedCdcGuidelineEngineReadAdapter = { get: getGovernedCdcGuidelineEngine };
