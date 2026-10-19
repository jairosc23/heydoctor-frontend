import {
  PHYSICIAN_REVIEW_CHECKLIST_WORKSPACE_GOVERNANCE,
  type PhysicianReviewChecklistWorkspace,
  type PhysicianReviewChecklistWorkspaceBuilderResult,
  type PhysicianReviewChecklistWorkspaceSlot,
  type AiLayerProviderId,
} from "./physician-review-checklist-workspace";

export function mapPhysicianReviewChecklistWorkspaceEnvelope(payload: unknown): PhysicianReviewChecklistWorkspaceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "physician_review_checklist_workspace"
      ? root
      : root.checklistWorkspace && typeof root.checklistWorkspace === "object" &&
          (root.checklistWorkspace as { source?: string }).source === "physician_review_checklist_workspace"
        ? (root.checklistWorkspace as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapPhysicianReviewChecklistWorkspace(resultObj.checklistWorkspace);
  if (!mapped) return null;
  return {
    source: "physician_review_checklist_workspace",
    builderVersion: "1.0.0",
    checklistWorkspace: mapped,
    governance: { ...PHYSICIAN_REVIEW_CHECKLIST_WORKSPACE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapPhysicianReviewChecklistWorkspace(raw: unknown): PhysicianReviewChecklistWorkspace | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.checklistWorkspaceId !== "string" || !String(r.checklistWorkspaceId).trim()) return null;
  if (!Array.isArray(r.checklistViewSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.checklistViewSlots.map(mapSlot).filter((s): s is PhysicianReviewChecklistWorkspaceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    checklistWorkspaceId: String(r.checklistWorkspaceId).trim(),
    providerId,
    checklistViewSlots: slots,
    governance: { ...PHYSICIAN_REVIEW_CHECKLIST_WORKSPACE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      physicianReviewPackageId: String(meta.physicianReviewPackageId ?? ""),
      checklistId: String(meta.checklistId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): PhysicianReviewChecklistWorkspaceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "checklist_view_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "checklist_view_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
