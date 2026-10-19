import { getMedicalCopilotGovernedDiabetesGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiabetesGuidelineEngineEnvelope } from "./governed-diabetes-guideline-engine-mapper";
import type { GovernedDiabetesGuidelineEngineResult } from "./governed-diabetes-guideline-engine";

export type GovernedDiabetesGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedDiabetesGuidelineEngineResult | null>;
};

export async function getGovernedDiabetesGuidelineEngine(sessionId: string): Promise<GovernedDiabetesGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedDiabetesGuidelineEngine(sessionId);
  return mapGovernedDiabetesGuidelineEngineEnvelope(envelope);
}

export const governedDiabetesGuidelineEngineReadAdapter: GovernedDiabetesGuidelineEngineReadAdapter = { get: getGovernedDiabetesGuidelineEngine };
