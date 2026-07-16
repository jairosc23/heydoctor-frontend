import { getMedicalCopilotGovernedReferralPersistenceExecution } from "../../api";
import { mapGovernedReferralPersistenceExecutionEnvelope } from "./governed-referral-persistence-execution-mapper";
import type { GovernedReferralPersistenceExecutionResult } from "./governed-referral-persistence-execution";
export async function getGovernedReferralPersistenceExecution(sessionId: string): Promise<GovernedReferralPersistenceExecutionResult | null> {
  const envelope = await getMedicalCopilotGovernedReferralPersistenceExecution(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedReferralPersistenceExecutionEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedReferralPersistenceExecutionReadAdapter = { getGovernedReferralPersistenceExecution: typeof getGovernedReferralPersistenceExecution };
export const governedReferralPersistenceExecutionReadAdapter: GovernedReferralPersistenceExecutionReadAdapter = { getGovernedReferralPersistenceExecution };
