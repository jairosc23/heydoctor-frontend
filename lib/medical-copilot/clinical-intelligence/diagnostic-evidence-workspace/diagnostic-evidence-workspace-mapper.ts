import {
  DIAGNOSTIC_EVIDENCE_WORKSPACE_GOVERNANCE,
  type DiagnosticEvidenceWorkspace,
  type DiagnosticEvidenceWorkspaceBuilderResult,
  type DiagnosticEvidenceWorkspaceSlot,
  type AiLayerProviderId,
} from "./diagnostic-evidence-workspace";

export function mapDiagnosticEvidenceWorkspaceEnvelope(payload: unknown): DiagnosticEvidenceWorkspaceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "diagnostic_evidence_workspace"
      ? root
      : root.evidenceWorkspace && typeof root.evidenceWorkspace === "object" &&
          (root.evidenceWorkspace as { source?: string }).source === "diagnostic_evidence_workspace"
        ? (root.evidenceWorkspace as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapDiagnosticEvidenceWorkspace(resultObj.evidenceWorkspace);
  if (!mapped) return null;
  return {
    source: "diagnostic_evidence_workspace",
    builderVersion: "1.0.0",
    evidenceWorkspace: mapped,
    governance: { ...DIAGNOSTIC_EVIDENCE_WORKSPACE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapDiagnosticEvidenceWorkspace(raw: unknown): DiagnosticEvidenceWorkspace | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.evidenceWorkspaceId !== "string" || !String(r.evidenceWorkspaceId).trim()) return null;
  if (!Array.isArray(r.evidenceViewSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.evidenceViewSlots.map(mapSlot).filter((s): s is DiagnosticEvidenceWorkspaceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    evidenceWorkspaceId: String(r.evidenceWorkspaceId).trim(),
    providerId,
    evidenceViewSlots: slots,
    governance: { ...DIAGNOSTIC_EVIDENCE_WORKSPACE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      workspaceId: String(meta.workspaceId ?? ""),
      evidenceMappingId: String(meta.evidenceMappingId ?? ""),
      findingRefId: String(meta.findingRefId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): DiagnosticEvidenceWorkspaceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "evidence_by_hypothesis_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "evidence_by_hypothesis_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
