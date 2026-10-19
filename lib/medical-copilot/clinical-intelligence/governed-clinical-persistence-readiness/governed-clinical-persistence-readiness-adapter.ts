import { getMedicalCopilotGovernedClinicalFinalReadinessPackage } from "../../api";
import { mapGovernedClinicalPersistenceReadinessEnvelope } from "./governed-clinical-persistence-readiness-mapper";
import type { GovernedClinicalPersistenceReadinessResult } from "./governed-clinical-persistence-readiness";

export async function getGovernedClinicalPersistenceReadiness(
  sessionId: string,
): Promise<GovernedClinicalPersistenceReadinessResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalFinalReadinessPackage(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalPersistenceReadinessEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalPersistenceReadinessReadAdapter = {
  getGovernedClinicalPersistenceReadiness: typeof getGovernedClinicalPersistenceReadiness;
};

export const governedClinicalPersistenceReadinessReadAdapter: GovernedClinicalPersistenceReadinessReadAdapter = {
  getGovernedClinicalPersistenceReadiness,
};
