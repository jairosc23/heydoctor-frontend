/**
 * AI-5 — Read adapter for Governed AI Execution Engine (Facade only).
 */

import { getMedicalCopilotGovernedAIExecution } from "../api";
import { mapGovernedAIExecutionEnvelope } from "./governed-ai-execution-mapper";
import type { GovernedAIExecutionEngineResult } from "./governed-ai-execution";

export async function getGovernedAIExecution(
  sessionId: string,
): Promise<GovernedAIExecutionEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedAIExecution(sessionId);
  return mapGovernedAIExecutionEnvelope(envelope.data ?? envelope);
}

export type GovernedAIExecutionReadAdapter = {
  getGovernedAIExecution: typeof getGovernedAIExecution;
};

export const governedAIExecutionReadAdapter: GovernedAIExecutionReadAdapter = {
  getGovernedAIExecution,
};
