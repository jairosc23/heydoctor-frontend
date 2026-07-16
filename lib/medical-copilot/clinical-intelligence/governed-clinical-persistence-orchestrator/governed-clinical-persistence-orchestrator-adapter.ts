import { getMedicalCopilotGovernedClinicalOrchestrationPackage } from "../../api";
import { mapGovernedClinicalPersistenceOrchestratorEnvelope } from "./governed-clinical-persistence-orchestrator-mapper";
import type { GovernedClinicalPersistenceOrchestratorResult } from "./governed-clinical-persistence-orchestrator";

export async function getGovernedClinicalPersistenceOrchestrator(
  sessionId: string,
): Promise<GovernedClinicalPersistenceOrchestratorResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalOrchestrationPackage(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalPersistenceOrchestratorEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalPersistenceOrchestratorReadAdapter = {
  getGovernedClinicalPersistenceOrchestrator: typeof getGovernedClinicalPersistenceOrchestrator;
};

export const governedClinicalPersistenceOrchestratorReadAdapter: GovernedClinicalPersistenceOrchestratorReadAdapter = {
  getGovernedClinicalPersistenceOrchestrator,
};
