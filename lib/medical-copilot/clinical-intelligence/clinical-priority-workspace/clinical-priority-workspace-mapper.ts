import {
  CLINICAL_PRIORITY_WORKSPACE_GOVERNANCE,
  type ClinicalPriorityWorkspace,
  type ClinicalPriorityWorkspaceBuilderResult,
  type ClinicalPriorityWorkspaceSlot,
  type AiLayerProviderId,
} from "./clinical-priority-workspace";

export function mapClinicalPriorityWorkspaceEnvelope(payload: unknown): ClinicalPriorityWorkspaceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "clinical_priority_workspace"
      ? root
      : root.priorityWorkspace && typeof root.priorityWorkspace === "object" &&
          (root.priorityWorkspace as { source?: string }).source === "clinical_priority_workspace"
        ? (root.priorityWorkspace as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapClinicalPriorityWorkspace(resultObj.priorityWorkspace);
  if (!mapped) return null;
  return {
    source: "clinical_priority_workspace",
    builderVersion: "1.0.0",
    priorityWorkspace: mapped,
    governance: { ...CLINICAL_PRIORITY_WORKSPACE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapClinicalPriorityWorkspace(raw: unknown): ClinicalPriorityWorkspace | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.priorityWorkspaceId !== "string" || !String(r.priorityWorkspaceId).trim()) return null;
  if (!Array.isArray(r.prioritySlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.prioritySlots.map(mapSlot).filter((s): s is ClinicalPriorityWorkspaceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    priorityWorkspaceId: String(r.priorityWorkspaceId).trim(),
    providerId,
    prioritySlots: slots,
    governance: { ...CLINICAL_PRIORITY_WORKSPACE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      confidenceId: String(meta.confidenceId ?? ""),
      evidenceWorkspaceId: String(meta.evidenceWorkspaceId ?? ""),
      gapAnalyzerId: String(meta.gapAnalyzerId ?? ""),
      documentaryPriority: String(meta.documentaryPriority ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): ClinicalPriorityWorkspaceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "documentary_priority_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "documentary_priority_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
