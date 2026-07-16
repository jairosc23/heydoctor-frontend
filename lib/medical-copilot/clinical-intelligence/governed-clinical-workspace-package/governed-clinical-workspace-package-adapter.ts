import { getMedicalCopilotGovernedClinicalWorkspacePackage } from "../../api";
import { mapGovernedClinicalWorkspacePackageEnvelope } from "./governed-clinical-workspace-package-mapper";
import type { GovernedClinicalWorkspacePackageResult } from "./governed-clinical-workspace-package";

export async function getGovernedClinicalWorkspacePackage(
  sessionId: string,
): Promise<GovernedClinicalWorkspacePackageResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalWorkspacePackage(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalWorkspacePackageEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalWorkspacePackageReadAdapter = {
  getGovernedClinicalWorkspacePackage: typeof getGovernedClinicalWorkspacePackage;
};

export const governedClinicalWorkspacePackageReadAdapter: GovernedClinicalWorkspacePackageReadAdapter = {
  getGovernedClinicalWorkspacePackage,
};
