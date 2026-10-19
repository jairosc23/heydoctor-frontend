import {
  EVIDENCE_CORRELATION_WORKSPACE_GOVERNANCE,
  type EvidenceCorrelationWorkspace,
  type EvidenceCorrelationWorkspaceBuilderResult,
  type EvidenceCorrelationWorkspaceSlot,
  type AiLayerProviderId,
} from "./evidence-correlation-workspace";

export function mapEvidenceCorrelationWorkspaceEnvelope(payload: unknown): EvidenceCorrelationWorkspaceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "evidence_correlation_workspace"
      ? root
      : root.evidenceCorrelationWorkspace && typeof root.evidenceCorrelationWorkspace === "object" &&
          (root.evidenceCorrelationWorkspace as { source?: string }).source === "evidence_correlation_workspace"
        ? (root.evidenceCorrelationWorkspace as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapEvidenceCorrelationWorkspace(resultObj.evidenceCorrelationWorkspace);
  if (!mapped) return null;
  return {
    source: "evidence_correlation_workspace",
    builderVersion: "1.0.0",
    evidenceCorrelationWorkspace: mapped,
    governance: { ...EVIDENCE_CORRELATION_WORKSPACE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapEvidenceCorrelationWorkspace(raw: unknown): EvidenceCorrelationWorkspace | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.evidenceCorrelationWorkspaceId !== "string" || !String(r.evidenceCorrelationWorkspaceId).trim()) return null;
  if (!Array.isArray(r.correlationSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.correlationSlots.map(mapSlot).filter((s): s is EvidenceCorrelationWorkspaceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    evidenceCorrelationWorkspaceId: String(r.evidenceCorrelationWorkspaceId).trim(),
    providerId,
    correlationSlots: slots,
    governance: { ...EVIDENCE_CORRELATION_WORKSPACE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      clinicalReasoningDatasetId: String(meta.clinicalReasoningDatasetId ?? ""),
      evidenceMappingId: String(meta.evidenceMappingId ?? ""),
      evidenceWorkspaceId: String(meta.evidenceWorkspaceId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): EvidenceCorrelationWorkspaceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "evidence_correlation_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "evidence_correlation_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
