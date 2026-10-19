import { getMedicalCopilotGovernedPrescriptionPersistenceExecution } from "../../api";
import { mapGovernedPrescriptionPersistenceExecutionEnvelope } from "./governed-prescription-persistence-execution-mapper";
import type { GovernedPrescriptionPersistenceExecutionResult } from "./governed-prescription-persistence-execution";
export async function getGovernedPrescriptionPersistenceExecution(sessionId: string): Promise<GovernedPrescriptionPersistenceExecutionResult | null> {
  const envelope = await getMedicalCopilotGovernedPrescriptionPersistenceExecution(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedPrescriptionPersistenceExecutionEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedPrescriptionPersistenceExecutionReadAdapter = { getGovernedPrescriptionPersistenceExecution: typeof getGovernedPrescriptionPersistenceExecution };
export const governedPrescriptionPersistenceExecutionReadAdapter: GovernedPrescriptionPersistenceExecutionReadAdapter = { getGovernedPrescriptionPersistenceExecution };
