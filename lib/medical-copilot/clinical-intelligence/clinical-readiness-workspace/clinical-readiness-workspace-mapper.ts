import {
  CLINICAL_READINESS_WORKSPACE_GOVERNANCE,
  type ClinicalReadinessWorkspace,
  type ClinicalReadinessWorkspaceBuilderResult,
  type ClinicalReadinessWorkspaceSlot,
  type AiLayerProviderId,
} from "./clinical-readiness-workspace";

export function mapClinicalReadinessWorkspaceEnvelope(payload: unknown): ClinicalReadinessWorkspaceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "clinical_readiness_workspace"
      ? root
      : root.readinessWorkspace && typeof root.readinessWorkspace === "object" &&
          (root.readinessWorkspace as { source?: string }).source === "clinical_readiness_workspace"
        ? (root.readinessWorkspace as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapClinicalReadinessWorkspace(resultObj.readinessWorkspace);
  if (!mapped) return null;
  return {
    source: "clinical_readiness_workspace",
    builderVersion: "1.0.0",
    readinessWorkspace: mapped,
    governance: { ...CLINICAL_READINESS_WORKSPACE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapClinicalReadinessWorkspace(raw: unknown): ClinicalReadinessWorkspace | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.readinessWorkspaceId !== "string" || !String(r.readinessWorkspaceId).trim()) return null;
  if (!Array.isArray(r.readinessSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.readinessSlots.map(mapSlot).filter((s): s is ClinicalReadinessWorkspaceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    readinessWorkspaceId: String(r.readinessWorkspaceId).trim(),
    providerId,
    readinessSlots: slots,
    governance: { ...CLINICAL_READINESS_WORKSPACE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      completenessId: String(meta.completenessId ?? ""),
      confidenceId: String(meta.confidenceId ?? ""),
      reviewSummaryId: String(meta.reviewSummaryId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): ClinicalReadinessWorkspaceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "readiness_state_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "readiness_state_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
