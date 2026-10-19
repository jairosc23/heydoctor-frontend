/**
 * AI-14 — Frontend mapper for GovernedPhysicianReviewPrep.
 */

import {
  PHYSICIAN_REVIEW_PREP_GOVERNANCE,
  type GovernedPhysicianReviewPrep,
  type GovernedPhysicianReviewPrepBuilderResult,
  type GovernedPhysicianReviewPrepSlot,
  type AiLayerProviderId,
} from "./governed-physician-review-prep";

export function mapGovernedPhysicianReviewPrepEnvelope(
  payload: unknown,
): GovernedPhysicianReviewPrepBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "governed_physician_review_prep"
      ? root
      : root.reviewPrep &&
          typeof root.reviewPrep === "object" &&
          (root.reviewPrep as { source?: string }).source === "governed_physician_review_prep"
        ? (root.reviewPrep as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const mapped = mapGovernedPhysicianReviewPrep(resultObj.reviewPrep);
  if (!mapped) return null;

  return {
    source: "governed_physician_review_prep",
    builderVersion: "1.0.0",
    reviewPrep: mapped,
    governance: { ...PHYSICIAN_REVIEW_PREP_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapGovernedPhysicianReviewPrep(raw: unknown): GovernedPhysicianReviewPrep | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.reviewPrepId !== "string" || !String(r.reviewPrepId).trim()) return null;
  if (!Array.isArray(r.reviewItems)) return null;
  if (!r.metadata || typeof r.metadata !== "object") return null;

  const slots = r.reviewItems
    .map(mapSlot)
    .filter((slot): slot is GovernedPhysicianReviewPrepSlot => slot !== null);

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
    reviewPrepId: String(r.reviewPrepId).trim(),
    providerId,
    reviewItems: slots,
    governance: { ...PHYSICIAN_REVIEW_PREP_GOVERNANCE },
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
      outputId: String(meta.outputId ?? ""),
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

function mapSlot(raw: unknown): GovernedPhysicianReviewPrepSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number") return null;
  if (slot.kind !== "review_prep_item") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;

  return {
    id: slot.id.trim(),
    sourceOutputItemId:
      typeof slot.sourceOutputItemId === "string" ? slot.sourceOutputItemId : null,
    order: slot.order,
    kind: "review_prep_item",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
