import {
  DIFFERENTIAL_REVIEW_WORKSPACE_GOVERNANCE,
  type DifferentialReviewWorkspace,
  type DifferentialReviewWorkspaceBuilderResult,
  type DifferentialReviewWorkspaceSlot,
  type AiLayerProviderId,
} from "./differential-review-workspace";

export function mapDifferentialReviewWorkspaceEnvelope(payload: unknown): DifferentialReviewWorkspaceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "differential_review_workspace"
      ? root
      : root.differentialReviewWorkspace && typeof root.differentialReviewWorkspace === "object" &&
          (root.differentialReviewWorkspace as { source?: string }).source === "differential_review_workspace"
        ? (root.differentialReviewWorkspace as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapDifferentialReviewWorkspace(resultObj.differentialReviewWorkspace);
  if (!mapped) return null;
  return {
    source: "differential_review_workspace",
    builderVersion: "1.0.0",
    differentialReviewWorkspace: mapped,
    governance: { ...DIFFERENTIAL_REVIEW_WORKSPACE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapDifferentialReviewWorkspace(raw: unknown): DifferentialReviewWorkspace | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.differentialReviewWorkspaceId !== "string" || !String(r.differentialReviewWorkspaceId).trim()) return null;
  if (!Array.isArray(r.differentialReviewSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.differentialReviewSlots.map(mapSlot).filter((s): s is DifferentialReviewWorkspaceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    differentialReviewWorkspaceId: String(r.differentialReviewWorkspaceId).trim(),
    providerId,
    differentialReviewSlots: slots,
    governance: { ...DIFFERENTIAL_REVIEW_WORKSPACE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      differentialId: String(meta.differentialId ?? ""),
      evidenceMappingId: String(meta.evidenceMappingId ?? ""),
      confidenceId: String(meta.confidenceId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): DifferentialReviewWorkspaceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "differential_review_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "differential_review_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
