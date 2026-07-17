import {
  GOVERNED_CLINICAL_REASONING_DATASET_GOVERNANCE,
  type GovernedClinicalReasoningDataset,
  type GovernedClinicalReasoningDatasetBuilderResult,
  type GovernedClinicalReasoningDatasetSlot,
  type AiLayerProviderId,
} from "./governed-clinical-reasoning-dataset";

export function mapGovernedClinicalReasoningDatasetEnvelope(payload: unknown): GovernedClinicalReasoningDatasetBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "governed_clinical_reasoning_dataset"
      ? root
      : root.governedClinicalReasoningDataset && typeof root.governedClinicalReasoningDataset === "object" &&
          (root.governedClinicalReasoningDataset as { source?: string }).source === "governed_clinical_reasoning_dataset"
        ? (root.governedClinicalReasoningDataset as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapGovernedClinicalReasoningDataset(resultObj.governedClinicalReasoningDataset);
  if (!mapped) return null;
  return {
    source: "governed_clinical_reasoning_dataset",
    builderVersion: "1.0.0",
    governedClinicalReasoningDataset: mapped,
    governance: { ...GOVERNED_CLINICAL_REASONING_DATASET_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapGovernedClinicalReasoningDataset(raw: unknown): GovernedClinicalReasoningDataset | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.governedClinicalReasoningDatasetId !== "string" || !String(r.governedClinicalReasoningDatasetId).trim()) return null;
  if (!Array.isArray(r.packageDatasetSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.packageDatasetSlots.map(mapSlot).filter((s): s is GovernedClinicalReasoningDatasetSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    governedClinicalReasoningDatasetId: String(r.governedClinicalReasoningDatasetId).trim(),
    providerId,
    packageDatasetSlots: slots,
    governance: { ...GOVERNED_CLINICAL_REASONING_DATASET_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      governedReasoningWorkspaceId: String(meta.governedReasoningWorkspaceId ?? ""),
      clinicalReasoningPackageId: String(meta.clinicalReasoningPackageId ?? ""),
      reviewSessionId: String(meta.reviewSessionId ?? ""),
      assessmentPackageId: String(meta.assessmentPackageId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): GovernedClinicalReasoningDatasetSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "governed_reasoning_dataset_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "governed_reasoning_dataset_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
