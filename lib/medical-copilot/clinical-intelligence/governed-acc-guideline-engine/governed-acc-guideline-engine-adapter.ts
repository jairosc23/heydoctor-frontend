import { getMedicalCopilotGovernedAccGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedAccGuidelineEngineEnvelope } from "./governed-acc-guideline-engine-mapper";
import type { GovernedAccGuidelineEngineResult } from "./governed-acc-guideline-engine";

export type GovernedAccGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedAccGuidelineEngineResult | null>;
};

export async function getGovernedAccGuidelineEngine(sessionId: string): Promise<GovernedAccGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedAccGuidelineEngine(sessionId);
  return mapGovernedAccGuidelineEngineEnvelope(envelope);
}

export const governedAccGuidelineEngineReadAdapter: GovernedAccGuidelineEngineReadAdapter = { get: getGovernedAccGuidelineEngine };
