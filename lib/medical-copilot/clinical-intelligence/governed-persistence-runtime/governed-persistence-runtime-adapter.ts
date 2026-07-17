import { getMedicalCopilotGovernedPersistenceRuntime } from "../../api";
import { mapGovernedPersistenceRuntimeEnvelope } from "./governed-persistence-runtime-mapper";
import type { GovernedPersistenceRuntimeResult } from "./governed-persistence-runtime";

export async function getGovernedPersistenceRuntime(
  sessionId: string,
): Promise<GovernedPersistenceRuntimeResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistenceRuntime(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistenceRuntimeEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistenceRuntimeReadAdapter = {
  getGovernedPersistenceRuntime: typeof getGovernedPersistenceRuntime;
};

export const governedPersistenceRuntimeReadAdapter: GovernedPersistenceRuntimeReadAdapter = {
  getGovernedPersistenceRuntime,
};
