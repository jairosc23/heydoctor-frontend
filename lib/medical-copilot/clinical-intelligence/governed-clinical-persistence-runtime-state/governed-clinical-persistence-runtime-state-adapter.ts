import { getMedicalCopilotGovernedClinicalPersistenceRuntimeState } from "../../api";
import { mapGovernedClinicalPersistenceRuntimeStateEnvelope } from "./governed-clinical-persistence-runtime-state-mapper";
import type { GovernedClinicalPersistenceRuntimeStateResult } from "./governed-clinical-persistence-runtime-state";

export async function getGovernedClinicalPersistenceRuntimeState(
  sessionId: string,
): Promise<GovernedClinicalPersistenceRuntimeStateResult | null> {
  const envelope =
    await getMedicalCopilotGovernedClinicalPersistenceRuntimeState(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalPersistenceRuntimeStateEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalPersistenceRuntimeStateReadAdapter = {
  getGovernedClinicalPersistenceRuntimeState: typeof getGovernedClinicalPersistenceRuntimeState;
};

export const governedClinicalPersistenceRuntimeStateReadAdapter: GovernedClinicalPersistenceRuntimeStateReadAdapter =
  {
    getGovernedClinicalPersistenceRuntimeState,
  };
