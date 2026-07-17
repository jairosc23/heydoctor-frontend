import { getMedicalCopilotGovernedConsultationRuntime } from "../../api";
import { mapGovernedConsultationRuntimeEnvelope } from "./governed-consultation-runtime-mapper";
import type { GovernedConsultationRuntimeResult } from "./governed-consultation-runtime";

export async function getGovernedConsultationRuntime(
  sessionId: string,
): Promise<GovernedConsultationRuntimeResult | null> {
  const envelope = await getMedicalCopilotGovernedConsultationRuntime(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedConsultationRuntimeEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedConsultationRuntimeReadAdapter = {
  getGovernedConsultationRuntime: typeof getGovernedConsultationRuntime;
};

export const governedConsultationRuntimeReadAdapter: GovernedConsultationRuntimeReadAdapter = {
  getGovernedConsultationRuntime,
};
