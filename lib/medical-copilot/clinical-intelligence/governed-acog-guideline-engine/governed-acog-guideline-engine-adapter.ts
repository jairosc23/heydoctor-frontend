import { getMedicalCopilotGovernedAcogGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedAcogGuidelineEngineEnvelope } from "./governed-acog-guideline-engine-mapper";
import type { GovernedAcogGuidelineEngineResult } from "./governed-acog-guideline-engine";

export type GovernedAcogGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedAcogGuidelineEngineResult | null>;
};

export async function getGovernedAcogGuidelineEngine(sessionId: string): Promise<GovernedAcogGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedAcogGuidelineEngine(sessionId);
  return mapGovernedAcogGuidelineEngineEnvelope(envelope);
}

export const governedAcogGuidelineEngineReadAdapter: GovernedAcogGuidelineEngineReadAdapter = { get: getGovernedAcogGuidelineEngine };
