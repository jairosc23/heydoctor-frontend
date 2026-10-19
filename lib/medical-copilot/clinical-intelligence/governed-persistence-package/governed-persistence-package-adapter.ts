import { getMedicalCopilotGovernedPersistencePackage } from "../../api";
import { mapGovernedPersistencePackageEnvelope } from "./governed-persistence-package-mapper";
import type { GovernedPersistencePackageResult } from "./governed-persistence-package";

export async function getGovernedPersistencePackage(
  sessionId: string,
): Promise<GovernedPersistencePackageResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistencePackage(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistencePackageEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistencePackageReadAdapter = {
  getGovernedPersistencePackage: typeof getGovernedPersistencePackage;
};

export const governedPersistencePackageReadAdapter: GovernedPersistencePackageReadAdapter = {
  getGovernedPersistencePackage,
};
