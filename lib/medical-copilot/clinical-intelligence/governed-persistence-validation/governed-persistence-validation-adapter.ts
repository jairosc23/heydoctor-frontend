import { getMedicalCopilotGovernedPersistenceValidation } from "../../api";
import { mapGovernedPersistenceValidationEnvelope } from "./governed-persistence-validation-mapper";
import type { GovernedPersistenceValidationResult } from "./governed-persistence-validation";

export async function getGovernedPersistenceValidation(
  sessionId: string,
): Promise<GovernedPersistenceValidationResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistenceValidation(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistenceValidationEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistenceValidationReadAdapter = {
  getGovernedPersistenceValidation: typeof getGovernedPersistenceValidation;
};

export const governedPersistenceValidationReadAdapter: GovernedPersistenceValidationReadAdapter = {
  getGovernedPersistenceValidation,
};
