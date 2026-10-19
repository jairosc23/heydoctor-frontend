/**
 * AI-8 — Frontend mapper for Governed Prompt Template.
 */

import {
  PROMPT_TEMPLATE_GOVERNANCE,
  type GovernedPromptTemplate,
  type GovernedPromptTemplateBuilderResult,
  type GovernedPromptTemplateSlot,
  type PromptTemplateProviderId,
} from "./governed-prompt-template";

export function mapGovernedPromptTemplateEnvelope(
  payload: unknown,
): GovernedPromptTemplateBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "governed_prompt_template"
      ? root
      : root.template &&
          typeof root.template === "object" &&
          (root.template as { source?: string }).source ===
            "governed_prompt_template"
        ? (root.template as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const template = mapGovernedPromptTemplate(resultObj.template);
  if (!template) return null;

  return {
    source: "governed_prompt_template",
    builderVersion: "1.0.0",
    template,
    governance: { ...PROMPT_TEMPLATE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapGovernedPromptTemplate(
  raw: unknown,
): GovernedPromptTemplate | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.templateId !== "string" || !r.templateId.trim()) return null;
  if (!Array.isArray(r.templateSlots)) return null;
  if (!r.metadata || typeof r.metadata !== "object") return null;

  const slots = r.templateSlots
    .map(mapTemplateSlot)
    .filter((slot): slot is GovernedPromptTemplateSlot => slot !== null);

  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as PromptTemplateProviderId;
  const selected =
    meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai"
      ? meta.selectedProviderId
      : providerId;
  const status =
    meta.status === "ok" ||
    meta.status === "empty" ||
    meta.status === "rejected"
      ? meta.status
      : "empty";

  return {
    templateId: r.templateId.trim(),
    providerId,
    templateSlots: slots,
    governance: { ...PROMPT_TEMPLATE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      executionId: String(meta.executionId ?? ""),
      responseId: String(meta.responseId ?? ""),
      promptId: String(meta.promptId ?? ""),
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

function mapTemplateSlot(raw: unknown): GovernedPromptTemplateSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number") return null;
  if (slot.kind !== "template_slot") return null;
  if (
    slot.status !== "ok" &&
    slot.status !== "empty" &&
    slot.status !== "rejected"
  ) {
    return null;
  }
  if (typeof slot.slotKey !== "string") return null;

  return {
    id: slot.id.trim(),
    sourcePromptSlotId:
      typeof slot.sourcePromptSlotId === "string"
        ? slot.sourcePromptSlotId
        : null,
    order: slot.order,
    kind: "template_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
