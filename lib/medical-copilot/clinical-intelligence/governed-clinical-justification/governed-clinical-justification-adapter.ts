import { getMedicalCopilotGovernedClinicalJustification } from "../../api";
import { mapGovernedClinicalJustificationEnvelope } from "./governed-clinical-justification-mapper";
import type { GovernedClinicalJustificationResult } from "./governed-clinical-justification";

export async function getGovernedClinicalJustification(sessionId: string): Promise<GovernedClinicalJustificationResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalJustification(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalJustificationEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedClinicalJustificationReadAdapter = { getGovernedClinicalJustification: typeof getGovernedClinicalJustification };
export const governedClinicalJustificationReadAdapter: GovernedClinicalJustificationReadAdapter = { getGovernedClinicalJustification };
