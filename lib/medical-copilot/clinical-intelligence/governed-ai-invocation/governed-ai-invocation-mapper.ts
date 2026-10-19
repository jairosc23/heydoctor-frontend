/**
 * AI-11 — Frontend mapper for GovernedAIInvocationResult.
 */

import {
  AI_INVOCATION_GOVERNANCE,
  type GovernedAIInvocationResult,
  type GovernedAIInvocationResultBuilderResult,
  type GovernedAIInvocationResultSlot,
  type AiLayerProviderId,
} from "./governed-ai-invocation";

export function mapGovernedAIInvocationResultEnvelope(
  payload: unknown,
): GovernedAIInvocationResultBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "governed_ai_invocation"
      ? root
      : root.invocation &&
          typeof root.invocation === "object" &&
          (root.invocation as { source?: string }).source === "governed_ai_invocation"
        ? (root.invocation as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const mapped = mapGovernedAIInvocationResult(resultObj.invocation);
  if (!mapped) return null;

  return {
    source: "governed_ai_invocation",
    builderVersion: "1.0.0",
    invocation: mapped,
    governance: { ...AI_INVOCATION_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapGovernedAIInvocationResult(raw: unknown): GovernedAIInvocationResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.invocationId !== "string" || !String(r.invocationId).trim()) return null;
  if (!Array.isArray(r.invocationSlots)) return null;
  if (!r.metadata || typeof r.metadata !== "object") return null;

  const slots = r.invocationSlots
    .map(mapSlot)
    .filter((slot): slot is GovernedAIInvocationResultSlot => slot !== null);

  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected =
    meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai"
      ? meta.selectedProviderId
      : providerId;
  const status =
    meta.status === "ok" || meta.status === "empty" || meta.status === "rejected"
      ? meta.status
      : "empty";

  return {
    invocationId: String(r.invocationId).trim(),
    providerId,
    invocationSlots: slots,
    governance: { ...AI_INVOCATION_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      executionId: String(meta.executionId ?? ""),
      responseId: String(meta.responseId ?? ""),
      promptId: String(meta.promptId ?? ""),
      templateId: String(meta.templateId ?? ""),
      composedPromptId: String(meta.composedPromptId ?? ""),
      payloadId: String(meta.payloadId ?? ""),
      generatedAt:
        typeof meta.generatedAt === "string"
          ? meta.generatedAt
          : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount:
        typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): GovernedAIInvocationResultSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number") return null;
  if (slot.kind !== "invocation_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;

  return {
    id: slot.id.trim(),
    sourcePayloadSlotId:
      typeof slot.sourcePayloadSlotId === "string" ? slot.sourcePayloadSlotId : null,
    order: slot.order,
    kind: "invocation_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
