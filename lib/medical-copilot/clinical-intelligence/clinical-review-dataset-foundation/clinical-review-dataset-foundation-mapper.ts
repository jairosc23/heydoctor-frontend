import {
  CLINICAL_REVIEW_DATASET_GOVERNANCE,
  type ClinicalReviewDatasetFoundation,
  type ClinicalReviewDatasetFoundationBuilderResult,
  type ClinicalReviewDatasetFoundationSlot,
  type AiLayerProviderId,
} from "./clinical-review-dataset-foundation";

export function mapClinicalReviewDatasetFoundationEnvelope(payload: unknown): ClinicalReviewDatasetFoundationBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "clinical_review_dataset_foundation"
      ? root
      : root.reviewDataset && typeof root.reviewDataset === "object" &&
          (root.reviewDataset as { source?: string }).source === "clinical_review_dataset_foundation"
        ? (root.reviewDataset as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapClinicalReviewDatasetFoundation(resultObj.reviewDataset);
  if (!mapped) return null;
  return {
    source: "clinical_review_dataset_foundation",
    builderVersion: "1.0.0",
    reviewDataset: mapped,
    governance: { ...CLINICAL_REVIEW_DATASET_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapClinicalReviewDatasetFoundation(raw: unknown): ClinicalReviewDatasetFoundation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.reviewDatasetId !== "string" || !String(r.reviewDatasetId).trim()) return null;
  if (!Array.isArray(r.datasetSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.datasetSlots.map(mapSlot).filter((s): s is ClinicalReviewDatasetFoundationSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    reviewDatasetId: String(r.reviewDatasetId).trim(),
    providerId,
    datasetSlots: slots,
    governance: { ...CLINICAL_REVIEW_DATASET_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      sessionPackageId: String(meta.sessionPackageId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): ClinicalReviewDatasetFoundationSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "review_dataset_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "review_dataset_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
