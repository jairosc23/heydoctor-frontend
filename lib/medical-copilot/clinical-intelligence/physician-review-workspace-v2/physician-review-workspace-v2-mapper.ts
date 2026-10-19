import {
  PHYSICIAN_REVIEW_WORKSPACE_V2_GOVERNANCE,
  type PhysicianReviewWorkspaceV2,
  type PhysicianReviewWorkspaceV2BuilderResult,
  type PhysicianReviewWorkspaceV2Slot,
  type AiLayerProviderId,
} from "./physician-review-workspace-v2";

export function mapPhysicianReviewWorkspaceV2Envelope(payload: unknown): PhysicianReviewWorkspaceV2BuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "physician_review_workspace_v2"
      ? root
      : root.reviewWorkspaceV2 && typeof root.reviewWorkspaceV2 === "object" &&
          (root.reviewWorkspaceV2 as { source?: string }).source === "physician_review_workspace_v2"
        ? (root.reviewWorkspaceV2 as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapPhysicianReviewWorkspaceV2(resultObj.reviewWorkspaceV2);
  if (!mapped) return null;
  return {
    source: "physician_review_workspace_v2",
    builderVersion: "1.0.0",
    reviewWorkspaceV2: mapped,
    governance: { ...PHYSICIAN_REVIEW_WORKSPACE_V2_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapPhysicianReviewWorkspaceV2(raw: unknown): PhysicianReviewWorkspaceV2 | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.reviewWorkspaceV2Id !== "string" || !String(r.reviewWorkspaceV2Id).trim()) return null;
  if (!Array.isArray(r.reviewViewSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.reviewViewSlots.map(mapSlot).filter((s): s is PhysicianReviewWorkspaceV2Slot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    reviewWorkspaceV2Id: String(r.reviewWorkspaceV2Id).trim(),
    providerId,
    reviewViewSlots: slots,
    governance: { ...PHYSICIAN_REVIEW_WORKSPACE_V2_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      workspaceId: String(meta.workspaceId ?? ""),
      evidenceWorkspaceId: String(meta.evidenceWorkspaceId ?? ""),
      gapAnalyzerId: String(meta.gapAnalyzerId ?? ""),
      priorityWorkspaceId: String(meta.priorityWorkspaceId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): PhysicianReviewWorkspaceV2Slot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "review_workspace_v2_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "review_workspace_v2_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
