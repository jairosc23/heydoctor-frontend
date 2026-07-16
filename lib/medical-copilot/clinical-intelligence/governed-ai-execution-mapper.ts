/**
 * AI-5 — Frontend mapper for Governed AI Execution Engine.
 */

import {
  EXECUTION_GOVERNANCE,
  type ExecutionProviderId,
  type GovernedAIExecutionEngineResult,
  type GovernedAIExecutionResult,
} from "./governed-ai-execution";

export function mapGovernedAIExecutionEnvelope(
  payload: unknown,
): GovernedAIExecutionEngineResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "governed_ai_execution"
      ? root
      : root.execution &&
          typeof root.execution === "object" &&
          (root.execution as { source?: string }).source ===
            "governed_ai_execution"
        ? (root.execution as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const response = mapExecutionResult(resultObj.response);
  if (!response) return null;

  return {
    source: "governed_ai_execution",
    executionVersion: "1.0.0",
    response,
    governance: { ...EXECUTION_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapExecutionResult(
  raw: unknown,
): GovernedAIExecutionResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.executionId !== "string" || !r.executionId.trim()) return null;
  if (
    r.status !== "ok" &&
    r.status !== "empty" &&
    r.status !== "rejected"
  ) {
    return null;
  }
  if (!r.metadata || typeof r.metadata !== "object") return null;

  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as ExecutionProviderId;
  const selected =
    meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai"
      ? meta.selectedProviderId
      : providerId;

  return {
    executionId: r.executionId.trim(),
    providerId,
    status: r.status,
    governance: { ...EXECUTION_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      generatedAt:
        typeof meta.generatedAt === "string"
          ? meta.generatedAt
          : new Date().toISOString(),
      executionVersion: "1.0.0",
      selectedProviderId: selected,
    },
  };
}
