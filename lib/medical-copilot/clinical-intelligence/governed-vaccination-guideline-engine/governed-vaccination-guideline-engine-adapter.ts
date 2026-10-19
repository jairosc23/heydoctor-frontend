import { getMedicalCopilotGovernedVaccinationGuidelineEngine } from "@/lib/medical-copilot/api";
import { mapGovernedVaccinationGuidelineEngineEnvelope } from "./governed-vaccination-guideline-engine-mapper";
import type { GovernedVaccinationGuidelineEngineResult } from "./governed-vaccination-guideline-engine";

export type GovernedVaccinationGuidelineEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedVaccinationGuidelineEngineResult | null>;
};

export async function getGovernedVaccinationGuidelineEngine(sessionId: string): Promise<GovernedVaccinationGuidelineEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedVaccinationGuidelineEngine(sessionId);
  return mapGovernedVaccinationGuidelineEngineEnvelope(envelope);
}

export const governedVaccinationGuidelineEngineReadAdapter: GovernedVaccinationGuidelineEngineReadAdapter = { get: getGovernedVaccinationGuidelineEngine };
