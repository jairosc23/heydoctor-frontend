import { getMedicalCopilotGovernedSurvivingSepsisGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedSurvivingSepsisGuidelineEngineEnvelope } from "./governed-surviving-sepsis-guideline-engine-mapper";
import type { GovernedSurvivingSepsisGuidelineEngineResult } from "./governed-surviving-sepsis-guideline-engine";

export type GovernedSurvivingSepsisGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedSurvivingSepsisGuidelineEngineResult | null>;
};

export async function getGovernedSurvivingSepsisGuidelineEngine(sessionId: string): Promise<GovernedSurvivingSepsisGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedSurvivingSepsisGuidelineEngine(sessionId);
  return mapGovernedSurvivingSepsisGuidelineEngineEnvelope(envelope);
}

export const governedSurvivingSepsisGuidelineEngineReadAdapter: GovernedSurvivingSepsisGuidelineEngineReadAdapter = { get: getGovernedSurvivingSepsisGuidelineEngine };
