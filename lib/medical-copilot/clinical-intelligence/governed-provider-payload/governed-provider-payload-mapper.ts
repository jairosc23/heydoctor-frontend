/**
 * AI-10 — Frontend mapper for GovernedProviderPayload.
 */

import {
  PROVIDER_PAYLOAD_GOVERNANCE,
  type GovernedProviderPayload,
  type GovernedProviderPayloadBuilderResult,
  type GovernedProviderPayloadSlot,
  type AiLayerProviderId,
} from "./governed-provider-payload";

export function mapGovernedProviderPayloadEnvelope(
  payload: unknown,
): GovernedProviderPayloadBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "governed_provider_payload"
      ? root
      : root.payload &&
          typeof root.payload === "object" &&
          (root.payload as { source?: string }).source === "governed_provider_payload"
        ? (root.payload as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const mapped = mapGovernedProviderPayload(resultObj.payload);
  if (!mapped) return null;

  return {
    source: "governed_provider_payload",
    builderVersion: "1.0.0",
    payload: mapped,
    governance: { ...PROVIDER_PAYLOAD_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapGovernedProviderPayload(raw: unknown): GovernedProviderPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.payloadId !== "string" || !String(r.payloadId).trim()) return null;
  if (!Array.isArray(r.payloadSlots)) return null;
  if (!r.metadata || typeof r.metadata !== "object") return null;

  const slots = r.payloadSlots
    .map(mapSlot)
    .filter((slot): slot is GovernedProviderPayloadSlot => slot !== null);

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
    payloadId: String(r.payloadId).trim(),
    providerId,
    payloadSlots: slots,
    governance: { ...PROVIDER_PAYLOAD_GOVERNANCE },
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

function mapSlot(raw: unknown): GovernedProviderPayloadSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number") return null;
  if (slot.kind !== "payload_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;

  return {
    id: slot.id.trim(),
    sourceCompositionSlotId:
      typeof slot.sourceCompositionSlotId === "string" ? slot.sourceCompositionSlotId : null,
    order: slot.order,
    kind: "payload_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
