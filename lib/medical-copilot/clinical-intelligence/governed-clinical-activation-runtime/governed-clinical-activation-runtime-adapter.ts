import { getMedicalCopilotGovernedClinicalActivationRuntime } from "../../api";
import { mapGovernedClinicalActivationRuntimeEnvelope } from "./governed-clinical-activation-runtime-mapper";
import type { GovernedClinicalActivationRuntimeResult } from "./governed-clinical-activation-runtime";

export async function getGovernedClinicalActivationRuntime(
  sessionId: string,
): Promise<GovernedClinicalActivationRuntimeResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalActivationRuntime(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalActivationRuntimeEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalActivationRuntimeReadAdapter = {
  getGovernedClinicalActivationRuntime: typeof getGovernedClinicalActivationRuntime;
};

export const governedClinicalActivationRuntimeReadAdapter: GovernedClinicalActivationRuntimeReadAdapter = {
  getGovernedClinicalActivationRuntime,
};
