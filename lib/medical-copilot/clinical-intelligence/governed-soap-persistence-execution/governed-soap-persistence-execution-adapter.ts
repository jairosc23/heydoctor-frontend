import { getMedicalCopilotGovernedSoapPersistenceExecution } from "../../api";
import { mapGovernedSoapPersistenceExecutionEnvelope } from "./governed-soap-persistence-execution-mapper";
import type { GovernedSoapPersistenceExecutionResult } from "./governed-soap-persistence-execution";
export async function getGovernedSoapPersistenceExecution(sessionId: string): Promise<GovernedSoapPersistenceExecutionResult | null> {
  const envelope = await getMedicalCopilotGovernedSoapPersistenceExecution(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedSoapPersistenceExecutionEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedSoapPersistenceExecutionReadAdapter = { getGovernedSoapPersistenceExecution: typeof getGovernedSoapPersistenceExecution };
export const governedSoapPersistenceExecutionReadAdapter: GovernedSoapPersistenceExecutionReadAdapter = { getGovernedSoapPersistenceExecution };
