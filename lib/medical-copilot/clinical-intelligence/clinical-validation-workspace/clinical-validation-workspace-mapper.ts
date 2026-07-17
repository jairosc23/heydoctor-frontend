import {
  CLINICAL_VALIDATION_WORKSPACE_GOVERNANCE,
  type ClinicalValidationWorkspace,
  type ClinicalValidationWorkspaceBuilderResult,
  type ClinicalValidationWorkspaceSlot,
  type AiLayerProviderId,
} from "./clinical-validation-workspace";

export function mapClinicalValidationWorkspaceEnvelope(payload: unknown): ClinicalValidationWorkspaceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "clinical_validation_workspace"
      ? root
      : root.validationWorkspace && typeof root.validationWorkspace === "object" &&
          (root.validationWorkspace as { source?: string }).source === "clinical_validation_workspace"
        ? (root.validationWorkspace as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapClinicalValidationWorkspace(resultObj.validationWorkspace);
  if (!mapped) return null;
  return {
    source: "clinical_validation_workspace",
    builderVersion: "1.0.0",
    validationWorkspace: mapped,
    governance: { ...CLINICAL_VALIDATION_WORKSPACE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapClinicalValidationWorkspace(raw: unknown): ClinicalValidationWorkspace | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.validationWorkspaceId !== "string" || !String(r.validationWorkspaceId).trim()) return null;
  if (!Array.isArray(r.validationSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.validationSlots.map(mapSlot).filter((s): s is ClinicalValidationWorkspaceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    validationWorkspaceId: String(r.validationWorkspaceId).trim(),
    providerId,
    validationSlots: slots,
    governance: { ...CLINICAL_VALIDATION_WORKSPACE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      reviewDatasetId: String(meta.reviewDatasetId ?? ""),
      checklistId: String(meta.checklistId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): ClinicalValidationWorkspaceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "validation_state_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "validation_state_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
