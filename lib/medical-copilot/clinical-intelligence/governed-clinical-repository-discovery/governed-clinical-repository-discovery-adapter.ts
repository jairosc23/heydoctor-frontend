import { getMedicalCopilotGovernedClinicalRepositoryDiscovery } from "../../api";
import { mapGovernedClinicalRepositoryDiscoveryEnvelope } from "./governed-clinical-repository-discovery-mapper";
import type { GovernedClinicalRepositoryDiscoveryResult } from "./governed-clinical-repository-discovery";

export async function getGovernedClinicalRepositoryDiscovery(
  sessionId: string,
): Promise<GovernedClinicalRepositoryDiscoveryResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalRepositoryDiscovery(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalRepositoryDiscoveryEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalRepositoryDiscoveryReadAdapter = {
  getGovernedClinicalRepositoryDiscovery: typeof getGovernedClinicalRepositoryDiscovery;
};

export const governedClinicalRepositoryDiscoveryReadAdapter: GovernedClinicalRepositoryDiscoveryReadAdapter = {
  getGovernedClinicalRepositoryDiscovery,
};
