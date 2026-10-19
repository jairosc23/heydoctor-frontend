import { getMedicalCopilotGovernedPhysicianRuntimePackage } from "../../api";
import { mapGovernedPhysicianRuntimePackageEnvelope } from "./governed-physician-runtime-package-mapper";
import type { GovernedPhysicianRuntimePackageResult } from "./governed-physician-runtime-package";

export async function getGovernedPhysicianRuntimePackage(
  sessionId: string,
): Promise<GovernedPhysicianRuntimePackageResult | null> {
  const envelope = await getMedicalCopilotGovernedPhysicianRuntimePackage(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPhysicianRuntimePackageEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPhysicianRuntimePackageReadAdapter = {
  getGovernedPhysicianRuntimePackage: typeof getGovernedPhysicianRuntimePackage;
};

export const governedPhysicianRuntimePackageReadAdapter: GovernedPhysicianRuntimePackageReadAdapter = {
  getGovernedPhysicianRuntimePackage,
};
