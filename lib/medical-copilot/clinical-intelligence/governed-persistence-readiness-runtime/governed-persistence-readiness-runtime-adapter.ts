import { getMedicalCopilotGovernedPersistenceReadinessRuntime } from "../../api";
import { mapGovernedPersistenceReadinessRuntimeEnvelope } from "./governed-persistence-readiness-runtime-mapper";
import type { GovernedPersistenceReadinessRuntimeResult } from "./governed-persistence-readiness-runtime";

export async function getGovernedPersistenceReadinessRuntime(
  sessionId: string,
): Promise<GovernedPersistenceReadinessRuntimeResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistenceReadinessRuntime(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistenceReadinessRuntimeEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistenceReadinessRuntimeReadAdapter = {
  getGovernedPersistenceReadinessRuntime: typeof getGovernedPersistenceReadinessRuntime;
};

export const governedPersistenceReadinessRuntimeReadAdapter: GovernedPersistenceReadinessRuntimeReadAdapter = {
  getGovernedPersistenceReadinessRuntime,
};
