import { getMedicalCopilotGovernedProviderExecution } from "../../api";
import { mapGovernedProviderExecutionResultEnvelope } from "./governed-provider-execution-mapper";
import type { GovernedProviderExecutionResultBuilderResult } from "./governed-provider-execution";

export async function getGovernedProviderExecution(sessionId: string): Promise<GovernedProviderExecutionResultBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedProviderExecution(sessionId);
  return mapGovernedProviderExecutionResultEnvelope(envelope.data ?? envelope);
}

export type GovernedProviderExecutionResultReadAdapter = { getGovernedProviderExecution: typeof getGovernedProviderExecution };
export const providerExecutionReadAdapter: GovernedProviderExecutionResultReadAdapter = { getGovernedProviderExecution };
