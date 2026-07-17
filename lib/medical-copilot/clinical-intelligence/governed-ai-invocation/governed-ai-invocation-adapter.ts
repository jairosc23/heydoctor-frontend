/**
 * AI-11 — Read adapter for GovernedAIInvocationResult (Facade only).
 */

import { getMedicalCopilotGovernedAIInvocation } from "../../api";
import { mapGovernedAIInvocationResultEnvelope } from "./governed-ai-invocation-mapper";
import type { GovernedAIInvocationResultBuilderResult } from "./governed-ai-invocation";

export async function getGovernedAIInvocation(
  sessionId: string,
): Promise<GovernedAIInvocationResultBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedAIInvocation(sessionId);
  return mapGovernedAIInvocationResultEnvelope(envelope.data ?? envelope);
}

export type GovernedAIInvocationResultReadAdapter = {
  getGovernedAIInvocation: typeof getGovernedAIInvocation;
};

export const invocationReadAdapter: GovernedAIInvocationResultReadAdapter = {
  getGovernedAIInvocation,
};
