import { getMedicalCopilotGovernedPersistenceReadinessPackage } from "../../api";
import { mapGovernedPersistenceReadinessPackageEnvelope } from "./governed-persistence-readiness-package-mapper";
import type { GovernedPersistenceReadinessPackageResult } from "./governed-persistence-readiness-package";

export async function getGovernedPersistenceReadinessPackage(
  sessionId: string,
): Promise<GovernedPersistenceReadinessPackageResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistenceReadinessPackage(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistenceReadinessPackageEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistenceReadinessPackageReadAdapter = {
  getGovernedPersistenceReadinessPackage: typeof getGovernedPersistenceReadinessPackage;
};

export const governedPersistenceReadinessPackageReadAdapter: GovernedPersistenceReadinessPackageReadAdapter = {
  getGovernedPersistenceReadinessPackage,
};
