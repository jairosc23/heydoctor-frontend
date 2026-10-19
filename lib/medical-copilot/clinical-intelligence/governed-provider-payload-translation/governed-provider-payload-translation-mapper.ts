import {
  PROVIDER_PAYLOAD_TRANSLATION_GOVERNANCE,
  type GovernedTranslatedProviderPayload,
  type GovernedTranslatedProviderPayloadBuilderResult,
  type GovernedTranslatedProviderPayloadSlot,
  type AiLayerProviderId,
} from "./governed-provider-payload-translation";

export function mapGovernedTranslatedProviderPayloadEnvelope(payload: unknown): GovernedTranslatedProviderPayloadBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "governed_provider_payload_translation"
      ? root
      : root.translation && typeof root.translation === "object" &&
          (root.translation as { source?: string }).source === "governed_provider_payload_translation"
        ? (root.translation as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapGovernedTranslatedProviderPayload(resultObj.translation);
  if (!mapped) return null;
  return {
    source: "governed_provider_payload_translation",
    builderVersion: "1.0.0",
    translation: mapped,
    governance: { ...PROVIDER_PAYLOAD_TRANSLATION_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapGovernedTranslatedProviderPayload(raw: unknown): GovernedTranslatedProviderPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.translationId !== "string" || !String(r.translationId).trim()) return null;
  if (!Array.isArray(r.translationSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.translationSlots.map(mapSlot).filter((s): s is GovernedTranslatedProviderPayloadSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    translationId: String(r.translationId).trim(),
    providerId,
    translationSlots: slots,
    governance: { ...PROVIDER_PAYLOAD_TRANSLATION_GOVERNANCE },
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
      assemblyId: String(meta.assemblyId ?? ""),
      targetProvider: String(meta.targetProvider ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): GovernedTranslatedProviderPayloadSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "translation_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "translation_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
