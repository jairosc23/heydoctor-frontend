/**
 * AI-9 — Frontend mapper for GovernedPrompt.
 */

import {
  PROMPT_COMPOSER_GOVERNANCE,
  type GovernedPrompt,
  type GovernedPromptBuilderResult,
  type GovernedPromptSlot,
  type AiLayerProviderId,
} from "./governed-prompt-composer";

export function mapGovernedPromptEnvelope(
  payload: unknown,
): GovernedPromptBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "governed_prompt_composer"
      ? root
      : root.composedPrompt &&
          typeof root.composedPrompt === "object" &&
          (root.composedPrompt as { source?: string }).source === "governed_prompt_composer"
        ? (root.composedPrompt as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const mapped = mapGovernedPrompt(resultObj.composedPrompt);
  if (!mapped) return null;

  return {
    source: "governed_prompt_composer",
    builderVersion: "1.0.0",
    composedPrompt: mapped,
    governance: { ...PROMPT_COMPOSER_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapGovernedPrompt(raw: unknown): GovernedPrompt | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.composedPromptId !== "string" || !String(r.composedPromptId).trim()) return null;
  if (!Array.isArray(r.compositionSlots)) return null;
  if (!r.metadata || typeof r.metadata !== "object") return null;

  const slots = r.compositionSlots
    .map(mapSlot)
    .filter((slot): slot is GovernedPromptSlot => slot !== null);

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
    composedPromptId: String(r.composedPromptId).trim(),
    providerId,
    compositionSlots: slots,
    governance: { ...PROMPT_COMPOSER_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      executionId: String(meta.executionId ?? ""),
      responseId: String(meta.responseId ?? ""),
      promptId: String(meta.promptId ?? ""),
      templateId: String(meta.templateId ?? ""),
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

function mapSlot(raw: unknown): GovernedPromptSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number") return null;
  if (slot.kind !== "composition_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;

  return {
    id: slot.id.trim(),
    sourceTemplateSlotId:
      typeof slot.sourceTemplateSlotId === "string" ? slot.sourceTemplateSlotId : null,
    order: slot.order,
    kind: "composition_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
