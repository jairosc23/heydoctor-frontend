import { getMedicalCopilotGovernedClinicalRepositoryRuntime } from "../../api";
import { mapGovernedClinicalRepositoryRuntimeEnvelope } from "./governed-clinical-repository-runtime-mapper";
import type { GovernedClinicalRepositoryRuntimeResult } from "./governed-clinical-repository-runtime";

export async function getGovernedClinicalRepositoryRuntime(
  sessionId: string,
): Promise<GovernedClinicalRepositoryRuntimeResult | null> {
  const envelope =
    await getMedicalCopilotGovernedClinicalRepositoryRuntime(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalRepositoryRuntimeEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalRepositoryRuntimeReadAdapter = {
  getGovernedClinicalRepositoryRuntime: typeof getGovernedClinicalRepositoryRuntime;
};

export const governedClinicalRepositoryRuntimeReadAdapter: GovernedClinicalRepositoryRuntimeReadAdapter =
  {
    getGovernedClinicalRepositoryRuntime,
  };
