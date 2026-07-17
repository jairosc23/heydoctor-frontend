import { getMedicalCopilotGovernedClinicalSafetyChecks } from "../../api";
import { mapGovernedClinicalSafetyChecksEnvelope } from "./governed-clinical-safety-checks-mapper";
import type { GovernedClinicalSafetyChecksResult } from "./governed-clinical-safety-checks";

export async function getGovernedClinicalSafetyChecks(sessionId: string): Promise<GovernedClinicalSafetyChecksResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalSafetyChecks(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalSafetyChecksEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedClinicalSafetyChecksReadAdapter = { getGovernedClinicalSafetyChecks: typeof getGovernedClinicalSafetyChecks };
export const governedClinicalSafetyChecksReadAdapter: GovernedClinicalSafetyChecksReadAdapter = { getGovernedClinicalSafetyChecks };
