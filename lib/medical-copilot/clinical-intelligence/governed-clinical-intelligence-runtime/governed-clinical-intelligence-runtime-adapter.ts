import { getMedicalCopilotGovernedClinicalIntelligenceRuntime } from "../../api";
import { mapGovernedClinicalIntelligenceRuntimeEnvelope } from "./governed-clinical-intelligence-runtime-mapper";
import type { GovernedClinicalIntelligenceRuntimeResult } from "./governed-clinical-intelligence-runtime";

export async function getGovernedClinicalIntelligenceRuntime(
  sessionId: string,
): Promise<GovernedClinicalIntelligenceRuntimeResult | null> {
  const envelope =
    await getMedicalCopilotGovernedClinicalIntelligenceRuntime(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalIntelligenceRuntimeEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalIntelligenceRuntimeReadAdapter = {
  getGovernedClinicalIntelligenceRuntime: typeof getGovernedClinicalIntelligenceRuntime;
};

export const governedClinicalIntelligenceRuntimeReadAdapter: GovernedClinicalIntelligenceRuntimeReadAdapter =
  { getGovernedClinicalIntelligenceRuntime };
