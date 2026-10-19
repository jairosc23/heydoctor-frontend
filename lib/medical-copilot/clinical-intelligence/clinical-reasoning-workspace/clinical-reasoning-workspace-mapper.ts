import {
  CLINICAL_REASONING_WORKSPACE_GOVERNANCE,
  type ClinicalReasoningWorkspace,
  type ClinicalReasoningWorkspaceBuilderResult,
  type ClinicalReasoningWorkspaceSlot,
  type AiLayerProviderId,
} from "./clinical-reasoning-workspace";

export function mapClinicalReasoningWorkspaceEnvelope(payload: unknown): ClinicalReasoningWorkspaceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "clinical_reasoning_workspace"
      ? root
      : root.reasoningWorkspace && typeof root.reasoningWorkspace === "object" &&
          (root.reasoningWorkspace as { source?: string }).source === "clinical_reasoning_workspace"
        ? (root.reasoningWorkspace as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapClinicalReasoningWorkspace(resultObj.reasoningWorkspace);
  if (!mapped) return null;
  return {
    source: "clinical_reasoning_workspace",
    builderVersion: "1.0.0",
    reasoningWorkspace: mapped,
    governance: { ...CLINICAL_REASONING_WORKSPACE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapClinicalReasoningWorkspace(raw: unknown): ClinicalReasoningWorkspace | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalReasoningWorkspaceId !== "string" || !String(r.clinicalReasoningWorkspaceId).trim()) return null;
  if (!Array.isArray(r.reasoningSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.reasoningSlots.map(mapSlot).filter((s): s is ClinicalReasoningWorkspaceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    clinicalReasoningWorkspaceId: String(r.clinicalReasoningWorkspaceId).trim(),
    providerId,
    reasoningSlots: slots,
    governance: { ...CLINICAL_REASONING_WORKSPACE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      assessmentPackageId: String(meta.assessmentPackageId ?? ""),
      contextId: String(meta.contextId ?? ""),
      clinicalPlanId: String(meta.clinicalPlanId ?? ""),
      confidenceId: String(meta.confidenceId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): ClinicalReasoningWorkspaceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "reasoning_workspace_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "reasoning_workspace_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
