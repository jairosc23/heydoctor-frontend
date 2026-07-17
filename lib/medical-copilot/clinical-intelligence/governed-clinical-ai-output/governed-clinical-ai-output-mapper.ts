/**
 * AI-13 — Frontend mapper for GovernedClinicalAIOutput.
 */

import {
  CLINICAL_AI_OUTPUT_GOVERNANCE,
  type GovernedClinicalAIOutput,
  type GovernedClinicalAIOutputBuilderResult,
  type GovernedClinicalAIOutputSlot,
  type AiLayerProviderId,
} from "./governed-clinical-ai-output";

export function mapGovernedClinicalAIOutputEnvelope(
  payload: unknown,
): GovernedClinicalAIOutputBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "governed_clinical_ai_output"
      ? root
      : root.output &&
          typeof root.output === "object" &&
          (root.output as { source?: string }).source === "governed_clinical_ai_output"
        ? (root.output as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const mapped = mapGovernedClinicalAIOutput(resultObj.output);
  if (!mapped) return null;

  return {
    source: "governed_clinical_ai_output",
    builderVersion: "1.0.0",
    output: mapped,
    governance: { ...CLINICAL_AI_OUTPUT_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapGovernedClinicalAIOutput(raw: unknown): GovernedClinicalAIOutput | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.outputId !== "string" || !String(r.outputId).trim()) return null;
  if (!Array.isArray(r.outputItems)) return null;
  if (!r.metadata || typeof r.metadata !== "object") return null;

  const slots = r.outputItems
    .map(mapSlot)
    .filter((slot): slot is GovernedClinicalAIOutputSlot => slot !== null);

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
    outputId: String(r.outputId).trim(),
    providerId,
    outputItems: slots,
    governance: { ...CLINICAL_AI_OUTPUT_GOVERNANCE },
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
      normalizedId: String(meta.normalizedId ?? ""),
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

function mapSlot(raw: unknown): GovernedClinicalAIOutputSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number") return null;
  if (slot.kind !== "output_item") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;

  return {
    id: slot.id.trim(),
    sourceNormalizedSlotId:
      typeof slot.sourceNormalizedSlotId === "string" ? slot.sourceNormalizedSlotId : null,
    order: slot.order,
    kind: "output_item",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
