/**
 * AI-7 — Frontend mapper for Governed AI Prompt.
 */

import {
  PROMPT_GOVERNANCE,
  type GovernedAIPrompt,
  type GovernedAIPromptBuilderResult,
  type GovernedAIPromptSlot,
  type PromptProviderId,
} from "./governed-ai-prompt";

export function mapGovernedAIPromptEnvelope(
  payload: unknown,
): GovernedAIPromptBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "governed_ai_prompt"
      ? root
      : root.prompt &&
          typeof root.prompt === "object" &&
          (root.prompt as { source?: string }).source === "governed_ai_prompt"
        ? (root.prompt as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const prompt = mapGovernedAIPrompt(resultObj.prompt);
  if (!prompt) return null;

  return {
    source: "governed_ai_prompt",
    builderVersion: "1.0.0",
    prompt,
    governance: { ...PROMPT_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapGovernedAIPrompt(raw: unknown): GovernedAIPrompt | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.promptId !== "string" || !r.promptId.trim()) return null;
  if (!Array.isArray(r.promptSlots)) return null;
  if (!r.metadata || typeof r.metadata !== "object") return null;

  const slots = r.promptSlots
    .map(mapPromptSlot)
    .filter((slot): slot is GovernedAIPromptSlot => slot !== null);

  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as PromptProviderId;
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
    promptId: r.promptId.trim(),
    providerId,
    promptSlots: slots,
    governance: { ...PROMPT_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      executionId: String(meta.executionId ?? ""),
      responseId: String(meta.responseId ?? ""),
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

function mapPromptSlot(raw: unknown): GovernedAIPromptSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number") return null;
  if (slot.kind !== "prompt_slot") return null;
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
    sourceResponseItemId:
      typeof slot.sourceResponseItemId === "string"
        ? slot.sourceResponseItemId
        : null,
    order: slot.order,
    kind: "prompt_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
