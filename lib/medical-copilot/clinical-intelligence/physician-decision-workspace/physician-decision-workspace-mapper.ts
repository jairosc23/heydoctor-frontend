import {
  PHYSICIAN_DECISION_WORKSPACE_GOVERNANCE,
  type PhysicianDecisionWorkspace,
  type PhysicianDecisionWorkspaceBuilderResult,
  type PhysicianDecisionWorkspaceSlot,
  type AiLayerProviderId,
} from "./physician-decision-workspace";

export function mapPhysicianDecisionWorkspaceEnvelope(payload: unknown): PhysicianDecisionWorkspaceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "physician_decision_workspace"
      ? root
      : root.workspace && typeof root.workspace === "object" &&
          (root.workspace as { source?: string }).source === "physician_decision_workspace"
        ? (root.workspace as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapPhysicianDecisionWorkspace(resultObj.workspace);
  if (!mapped) return null;
  return {
    source: "physician_decision_workspace",
    builderVersion: "1.0.0",
    workspace: mapped,
    governance: { ...PHYSICIAN_DECISION_WORKSPACE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapPhysicianDecisionWorkspace(raw: unknown): PhysicianDecisionWorkspace | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.workspaceId !== "string" || !String(r.workspaceId).trim()) return null;
  if (!Array.isArray(r.viewSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.viewSlots.map(mapSlot).filter((s): s is PhysicianDecisionWorkspaceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    workspaceId: String(r.workspaceId).trim(),
    providerId,
    viewSlots: slots,
    governance: { ...PHYSICIAN_DECISION_WORKSPACE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      contextId: String(meta.contextId ?? ""),
      findingRefId: String(meta.findingRefId ?? ""),
      insightRefId: String(meta.insightRefId ?? ""),
      recommendationRefId: String(meta.recommendationRefId ?? ""),
      reviewId: String(meta.reviewId ?? ""),
      caseId: String(meta.caseId ?? ""),
      clinicalPlanId: String(meta.clinicalPlanId ?? ""),
      responseId: String(meta.responseId ?? ""),
      differentialId: String(meta.differentialId ?? ""),
      evidenceMappingId: String(meta.evidenceMappingId ?? ""),
      confidenceId: String(meta.confidenceId ?? ""),
      missingInformationId: String(meta.missingInformationId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): PhysicianDecisionWorkspaceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "workspace_view_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "workspace_view_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
