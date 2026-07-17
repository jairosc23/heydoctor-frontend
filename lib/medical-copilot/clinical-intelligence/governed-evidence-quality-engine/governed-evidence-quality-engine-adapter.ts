import { getMedicalCopilotGovernedEvidenceQualityEngine } from "@/lib/medical-copilot/api";
import { mapGovernedEvidenceQualityEngineEnvelope } from "./governed-evidence-quality-engine-mapper";
import type { GovernedEvidenceQualityEngineResult } from "./governed-evidence-quality-engine";

export type GovernedEvidenceQualityEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedEvidenceQualityEngineResult | null>;
};

export async function getGovernedEvidenceQualityEngine(sessionId: string): Promise<GovernedEvidenceQualityEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedEvidenceQualityEngine(sessionId);
  return mapGovernedEvidenceQualityEngineEnvelope(envelope);
}

export const governedEvidenceQualityEngineReadAdapter: GovernedEvidenceQualityEngineReadAdapter = {
  get: getGovernedEvidenceQualityEngine,
};
