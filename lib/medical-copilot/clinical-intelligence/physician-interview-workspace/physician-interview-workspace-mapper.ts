import {
  PHYSICIAN_INTERVIEW_WORKSPACE_GOVERNANCE,
  type PhysicianInterviewWorkspace,
  type PhysicianInterviewWorkspaceBuilderResult,
  type PhysicianInterviewWorkspaceSlot,
  type AiLayerProviderId,
} from "./physician-interview-workspace";

export function mapPhysicianInterviewWorkspaceEnvelope(payload: unknown): PhysicianInterviewWorkspaceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "physician_interview_workspace"
      ? root
      : root.interviewWorkspace && typeof root.interviewWorkspace === "object" &&
          (root.interviewWorkspace as { source?: string }).source === "physician_interview_workspace"
        ? (root.interviewWorkspace as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapPhysicianInterviewWorkspace(resultObj.interviewWorkspace);
  if (!mapped) return null;
  return {
    source: "physician_interview_workspace",
    builderVersion: "1.0.0",
    interviewWorkspace: mapped,
    governance: { ...PHYSICIAN_INTERVIEW_WORKSPACE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapPhysicianInterviewWorkspace(raw: unknown): PhysicianInterviewWorkspace | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.interviewWorkspaceId !== "string" || !String(r.interviewWorkspaceId).trim()) return null;
  if (!Array.isArray(r.interviewSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.interviewSlots.map(mapSlot).filter((s): s is PhysicianInterviewWorkspaceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    interviewWorkspaceId: String(r.interviewWorkspaceId).trim(),
    providerId,
    interviewSlots: slots,
    governance: { ...PHYSICIAN_INTERVIEW_WORKSPACE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      clinicalQuestionsId: String(meta.clinicalQuestionsId ?? ""),
      reviewSessionId: String(meta.reviewSessionId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): PhysicianInterviewWorkspaceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "interview_view_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "interview_view_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
