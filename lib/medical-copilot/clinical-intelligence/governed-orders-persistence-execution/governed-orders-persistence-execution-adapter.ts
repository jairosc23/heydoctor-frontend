import { getMedicalCopilotGovernedOrdersPersistenceExecution } from "../../api";
import { mapGovernedOrdersPersistenceExecutionEnvelope } from "./governed-orders-persistence-execution-mapper";
import type { GovernedOrdersPersistenceExecutionResult } from "./governed-orders-persistence-execution";
export async function getGovernedOrdersPersistenceExecution(sessionId: string): Promise<GovernedOrdersPersistenceExecutionResult | null> {
  const envelope = await getMedicalCopilotGovernedOrdersPersistenceExecution(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedOrdersPersistenceExecutionEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedOrdersPersistenceExecutionReadAdapter = { getGovernedOrdersPersistenceExecution: typeof getGovernedOrdersPersistenceExecution };
export const governedOrdersPersistenceExecutionReadAdapter: GovernedOrdersPersistenceExecutionReadAdapter = { getGovernedOrdersPersistenceExecution };
