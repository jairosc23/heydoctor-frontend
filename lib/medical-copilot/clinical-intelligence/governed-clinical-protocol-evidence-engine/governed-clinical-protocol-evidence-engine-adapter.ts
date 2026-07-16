import { getMedicalCopilotGovernedClinicalProtocolEvidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalProtocolEvidenceEngineEnvelope } from "./governed-clinical-protocol-evidence-engine-mapper";
import type { GovernedClinicalProtocolEvidenceEngineResult } from "./governed-clinical-protocol-evidence-engine";

export type GovernedClinicalProtocolEvidenceEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedClinicalProtocolEvidenceEngineResult | null>;
};

export async function getGovernedClinicalProtocolEvidenceEngine(sessionId: string): Promise<GovernedClinicalProtocolEvidenceEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalProtocolEvidenceEngine(sessionId);
  return mapGovernedClinicalProtocolEvidenceEngineEnvelope(envelope);
}

export const governedClinicalProtocolEvidenceEngineReadAdapter: GovernedClinicalProtocolEvidenceEngineReadAdapter = {
  get: getGovernedClinicalProtocolEvidenceEngine,
};
