import {
  EVIDENCE_COMPLETENESS_WORKSPACE_GOVERNANCE,
  type EvidenceCompletenessWorkspace,
  type EvidenceCompletenessWorkspaceBuilderResult,
  type EvidenceCompletenessWorkspaceSlot,
  type AiLayerProviderId,
} from "./evidence-completeness-workspace";

export function mapEvidenceCompletenessWorkspaceEnvelope(payload: unknown): EvidenceCompletenessWorkspaceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "evidence_completeness_workspace"
      ? root
      : root.evidenceCompletenessWorkspace && typeof root.evidenceCompletenessWorkspace === "object" &&
          (root.evidenceCompletenessWorkspace as { source?: string }).source === "evidence_completeness_workspace"
        ? (root.evidenceCompletenessWorkspace as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapEvidenceCompletenessWorkspace(resultObj.evidenceCompletenessWorkspace);
  if (!mapped) return null;
  return {
    source: "evidence_completeness_workspace",
    builderVersion: "1.0.0",
    evidenceCompletenessWorkspace: mapped,
    governance: { ...EVIDENCE_COMPLETENESS_WORKSPACE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapEvidenceCompletenessWorkspace(raw: unknown): EvidenceCompletenessWorkspace | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.evidenceCompletenessWorkspaceId !== "string" || !String(r.evidenceCompletenessWorkspaceId).trim()) return null;
  if (!Array.isArray(r.evidenceCompletenessSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.evidenceCompletenessSlots.map(mapSlot).filter((s): s is EvidenceCompletenessWorkspaceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    evidenceCompletenessWorkspaceId: String(r.evidenceCompletenessWorkspaceId).trim(),
    providerId,
    evidenceCompletenessSlots: slots,
    governance: { ...EVIDENCE_COMPLETENESS_WORKSPACE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      evidenceWorkspaceId: String(meta.evidenceWorkspaceId ?? ""),
      gapAnalyzerId: String(meta.gapAnalyzerId ?? ""),
      missingInformationId: String(meta.missingInformationId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): EvidenceCompletenessWorkspaceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "evidence_completeness_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "evidence_completeness_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
