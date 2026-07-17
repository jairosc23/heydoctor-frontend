import {
  CLINICAL_REASONING_DATASET_GOVERNANCE,
  type ClinicalReasoningDataset,
  type ClinicalReasoningDatasetBuilderResult,
  type ClinicalReasoningDatasetSlot,
  type AiLayerProviderId,
} from "./clinical-reasoning-dataset";

export function mapClinicalReasoningDatasetEnvelope(payload: unknown): ClinicalReasoningDatasetBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "clinical_reasoning_dataset"
      ? root
      : root.clinicalReasoningDataset && typeof root.clinicalReasoningDataset === "object" &&
          (root.clinicalReasoningDataset as { source?: string }).source === "clinical_reasoning_dataset"
        ? (root.clinicalReasoningDataset as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapClinicalReasoningDataset(resultObj.clinicalReasoningDataset);
  if (!mapped) return null;
  return {
    source: "clinical_reasoning_dataset",
    builderVersion: "1.0.0",
    clinicalReasoningDataset: mapped,
    governance: { ...CLINICAL_REASONING_DATASET_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapClinicalReasoningDataset(raw: unknown): ClinicalReasoningDataset | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalReasoningDatasetId !== "string" || !String(r.clinicalReasoningDatasetId).trim()) return null;
  if (!Array.isArray(r.datasetSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.datasetSlots.map(mapSlot).filter((s): s is ClinicalReasoningDatasetSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    clinicalReasoningDatasetId: String(r.clinicalReasoningDatasetId).trim(),
    providerId,
    datasetSlots: slots,
    governance: { ...CLINICAL_REASONING_DATASET_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      clinicalReasoningPackageId: String(meta.clinicalReasoningPackageId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): ClinicalReasoningDatasetSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "reasoning_dataset_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "reasoning_dataset_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
