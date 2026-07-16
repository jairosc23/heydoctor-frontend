import { getMedicalCopilotGovernedPersistenceReadinessValidation } from "../../api";
import { mapGovernedPersistenceReadinessValidationEnvelope } from "./governed-persistence-readiness-validation-mapper";
import type { GovernedPersistenceReadinessValidationResult } from "./governed-persistence-readiness-validation";

export async function getGovernedPersistenceReadinessValidation(
  sessionId: string,
): Promise<GovernedPersistenceReadinessValidationResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistenceReadinessValidation(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistenceReadinessValidationEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistenceReadinessValidationReadAdapter = {
  getGovernedPersistenceReadinessValidation: typeof getGovernedPersistenceReadinessValidation;
};

export const governedPersistenceReadinessValidationReadAdapter: GovernedPersistenceReadinessValidationReadAdapter = {
  getGovernedPersistenceReadinessValidation,
};
