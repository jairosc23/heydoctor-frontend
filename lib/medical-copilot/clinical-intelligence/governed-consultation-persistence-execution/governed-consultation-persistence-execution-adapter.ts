import { getMedicalCopilotGovernedConsultationPersistenceExecution } from "../../api";
import { mapGovernedConsultationPersistenceExecutionEnvelope } from "./governed-consultation-persistence-execution-mapper";
import type { GovernedConsultationPersistenceExecutionResult } from "./governed-consultation-persistence-execution";

export async function getGovernedConsultationPersistenceExecution(sessionId: string): Promise<GovernedConsultationPersistenceExecutionResult | null> {
  const envelope = await getMedicalCopilotGovernedConsultationPersistenceExecution(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedConsultationPersistenceExecutionEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedConsultationPersistenceExecutionReadAdapter = { getGovernedConsultationPersistenceExecution: typeof getGovernedConsultationPersistenceExecution };
export const governedConsultationPersistenceExecutionReadAdapter: GovernedConsultationPersistenceExecutionReadAdapter = {
  getGovernedConsultationPersistenceExecution,
};
