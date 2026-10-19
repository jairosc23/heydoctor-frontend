import { getMedicalCopilotGovernedClinicalRiskDetection } from "../../api";
import { mapGovernedClinicalRiskDetectionEnvelope } from "./governed-clinical-risk-detection-mapper";
import type { GovernedClinicalRiskDetectionResult } from "./governed-clinical-risk-detection";

export async function getGovernedClinicalRiskDetection(sessionId: string): Promise<GovernedClinicalRiskDetectionResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalRiskDetection(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalRiskDetectionEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedClinicalRiskDetectionReadAdapter = { getGovernedClinicalRiskDetection: typeof getGovernedClinicalRiskDetection };
export const governedClinicalRiskDetectionReadAdapter: GovernedClinicalRiskDetectionReadAdapter = { getGovernedClinicalRiskDetection };
