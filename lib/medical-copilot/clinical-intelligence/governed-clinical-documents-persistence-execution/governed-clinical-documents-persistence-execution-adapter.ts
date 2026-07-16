import { getMedicalCopilotGovernedClinicalDocumentsPersistenceExecution } from "../../api";
import { mapGovernedClinicalDocumentsPersistenceExecutionEnvelope } from "./governed-clinical-documents-persistence-execution-mapper";
import type { GovernedClinicalDocumentsPersistenceExecutionResult } from "./governed-clinical-documents-persistence-execution";
export async function getGovernedClinicalDocumentsPersistenceExecution(sessionId: string): Promise<GovernedClinicalDocumentsPersistenceExecutionResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalDocumentsPersistenceExecution(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalDocumentsPersistenceExecutionEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedClinicalDocumentsPersistenceExecutionReadAdapter = { getGovernedClinicalDocumentsPersistenceExecution: typeof getGovernedClinicalDocumentsPersistenceExecution };
export const governedClinicalDocumentsPersistenceExecutionReadAdapter: GovernedClinicalDocumentsPersistenceExecutionReadAdapter = { getGovernedClinicalDocumentsPersistenceExecution };
