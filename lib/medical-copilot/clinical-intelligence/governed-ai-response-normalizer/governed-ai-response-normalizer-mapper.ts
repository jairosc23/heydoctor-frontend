/**
 * AI-12 — Frontend mapper for GovernedNormalizedAIResponse.
 */

import {
  AI_RESPONSE_NORMALIZER_GOVERNANCE,
  type GovernedNormalizedAIResponse,
  type GovernedNormalizedAIResponseBuilderResult,
  type GovernedNormalizedAIResponseSlot,
  type AiLayerProviderId,
} from "./governed-ai-response-normalizer";

export function mapGovernedNormalizedAIResponseEnvelope(
  payload: unknown,
): GovernedNormalizedAIResponseBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "governed_ai_response_normalizer"
      ? root
      : root.normalized &&
          typeof root.normalized === "object" &&
          (root.normalized as { source?: string }).source === "governed_ai_response_normalizer"
        ? (root.normalized as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const mapped = mapGovernedNormalizedAIResponse(resultObj.normalized);
  if (!mapped) return null;

  return {
    source: "governed_ai_response_normalizer",
    builderVersion: "1.0.0",
    normalized: mapped,
    governance: { ...AI_RESPONSE_NORMALIZER_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapGovernedNormalizedAIResponse(raw: unknown): GovernedNormalizedAIResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.normalizedId !== "string" || !String(r.normalizedId).trim()) return null;
  if (!Array.isArray(r.normalizedSlots)) return null;
  if (!r.metadata || typeof r.metadata !== "object") return null;

  const slots = r.normalizedSlots
    .map(mapSlot)
    .filter((slot): slot is GovernedNormalizedAIResponseSlot => slot !== null);

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
    normalizedId: String(r.normalizedId).trim(),
    providerId,
    normalizedSlots: slots,
    governance: { ...AI_RESPONSE_NORMALIZER_GOVERNANCE },
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
      invocationId: String(meta.invocationId ?? ""),
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

function mapSlot(raw: unknown): GovernedNormalizedAIResponseSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number") return null;
  if (slot.kind !== "normalized_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;

  return {
    id: slot.id.trim(),
    sourceInvocationSlotId:
      typeof slot.sourceInvocationSlotId === "string" ? slot.sourceInvocationSlotId : null,
    order: slot.order,
    kind: "normalized_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
