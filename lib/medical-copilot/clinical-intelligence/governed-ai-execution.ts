/**
 * AI-5 — Governed AI Execution Engine contracts (frontend).
 * ExecutionResult only — no LLM, SDKs, or clinical side effects.
 */

export const GOVERNED_AI_EXECUTION_VERSION = "1.0.0" as const;

export const EXECUTION_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type ExecutionProviderId = "noop" | "openai";

export type GovernedAIExecutionMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  generatedAt: string;
  executionVersion: typeof GOVERNED_AI_EXECUTION_VERSION;
  selectedProviderId: ExecutionProviderId;
};

/** Public ExecutionResult — ONLY these fields. */
export type GovernedAIExecutionResult = {
  executionId: string;
  providerId: ExecutionProviderId;
  status: "ok" | "empty" | "rejected";
  governance: typeof EXECUTION_GOVERNANCE;
  metadata: GovernedAIExecutionMetadata;
};

export type ExecutionResult = GovernedAIExecutionResult;

export type GovernedAIExecutionEngineResult = {
  source: "governed_ai_execution";
  executionVersion: typeof GOVERNED_AI_EXECUTION_VERSION;
  response: GovernedAIExecutionResult;
  governance: typeof EXECUTION_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
