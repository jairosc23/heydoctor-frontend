import { getMedicalCopilotGovernedClinicalRepositoryWiring } from "../../api";
import { mapGovernedClinicalRepositoryWiringEnvelope } from "./governed-clinical-repository-wiring-mapper";
import type { GovernedClinicalRepositoryWiringResult } from "./governed-clinical-repository-wiring";

export async function getGovernedClinicalRepositoryWiring(
  sessionId: string,
): Promise<GovernedClinicalRepositoryWiringResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalRepositoryWiring(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalRepositoryWiringEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalRepositoryWiringReadAdapter = {
  getGovernedClinicalRepositoryWiring: typeof getGovernedClinicalRepositoryWiring;
};

export const governedClinicalRepositoryWiringReadAdapter: GovernedClinicalRepositoryWiringReadAdapter = {
  getGovernedClinicalRepositoryWiring,
};
