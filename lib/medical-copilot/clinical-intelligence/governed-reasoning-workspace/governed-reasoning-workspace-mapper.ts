import {
  GOVERNED_REASONING_WORKSPACE_GOVERNANCE,
  type GovernedReasoningWorkspace,
  type GovernedReasoningWorkspaceBuilderResult,
  type GovernedReasoningWorkspaceSlot,
  type AiLayerProviderId,
} from "./governed-reasoning-workspace";

export function mapGovernedReasoningWorkspaceEnvelope(payload: unknown): GovernedReasoningWorkspaceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "governed_reasoning_workspace"
      ? root
      : root.governedReasoningWorkspace && typeof root.governedReasoningWorkspace === "object" &&
          (root.governedReasoningWorkspace as { source?: string }).source === "governed_reasoning_workspace"
        ? (root.governedReasoningWorkspace as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapGovernedReasoningWorkspace(resultObj.governedReasoningWorkspace);
  if (!mapped) return null;
  return {
    source: "governed_reasoning_workspace",
    builderVersion: "1.0.0",
    governedReasoningWorkspace: mapped,
    governance: { ...GOVERNED_REASONING_WORKSPACE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapGovernedReasoningWorkspace(raw: unknown): GovernedReasoningWorkspace | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.governedReasoningWorkspaceId !== "string" || !String(r.governedReasoningWorkspaceId).trim()) return null;
  if (!Array.isArray(r.reasoningViewSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.reasoningViewSlots.map(mapSlot).filter((s): s is GovernedReasoningWorkspaceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    governedReasoningWorkspaceId: String(r.governedReasoningWorkspaceId).trim(),
    providerId,
    reasoningViewSlots: slots,
    governance: { ...GOVERNED_REASONING_WORKSPACE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      clinicalPatternWorkspaceId: String(meta.clinicalPatternWorkspaceId ?? ""),
      physicianReasoningPreparationId: String(meta.physicianReasoningPreparationId ?? ""),
      confidenceId: String(meta.confidenceId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): GovernedReasoningWorkspaceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "governed_reasoning_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "governed_reasoning_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
