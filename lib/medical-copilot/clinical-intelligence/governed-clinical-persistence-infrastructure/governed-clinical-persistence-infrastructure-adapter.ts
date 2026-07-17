import { getMedicalCopilotGovernedClinicalPersistenceInfrastructure } from "../../api";
import { mapGovernedClinicalPersistenceInfrastructureEnvelope } from "./governed-clinical-persistence-infrastructure-mapper";
import type { GovernedClinicalPersistenceInfrastructureResult } from "./governed-clinical-persistence-infrastructure";

export async function getGovernedClinicalPersistenceInfrastructure(
  sessionId: string,
): Promise<GovernedClinicalPersistenceInfrastructureResult | null> {
  const envelope =
    await getMedicalCopilotGovernedClinicalPersistenceInfrastructure(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalPersistenceInfrastructureEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalPersistenceInfrastructureReadAdapter = {
  getGovernedClinicalPersistenceInfrastructure: typeof getGovernedClinicalPersistenceInfrastructure;
};

export const governedClinicalPersistenceInfrastructureReadAdapter: GovernedClinicalPersistenceInfrastructureReadAdapter =
  {
    getGovernedClinicalPersistenceInfrastructure,
  };
