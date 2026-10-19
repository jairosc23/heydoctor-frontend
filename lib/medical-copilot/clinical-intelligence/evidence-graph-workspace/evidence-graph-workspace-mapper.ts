import { EVIDENCE_GRAPH_WORKSPACE_GOVERNANCE, type EvidenceGraphWorkspace, type EvidenceGraphWorkspaceBuilderResult, type EvidenceGraphWorkspaceSlot, type AiLayerProviderId } from "./evidence-graph-workspace";
export function mapEvidenceGraphWorkspaceEnvelope(payload: unknown): EvidenceGraphWorkspaceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "evidence_graph_workspace" ? root : root.evidenceGraphWorkspace && typeof root.evidenceGraphWorkspace === "object" && (root.evidenceGraphWorkspace as { source?: string }).source === "evidence_graph_workspace" ? (root.evidenceGraphWorkspace as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapEvidenceGraphWorkspace(resultObj.evidenceGraphWorkspace);
  if (!mapped) return null;
  return { source: "evidence_graph_workspace", builderVersion: "1.0.0", evidenceGraphWorkspace: mapped, governance: { ...EVIDENCE_GRAPH_WORKSPACE_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapEvidenceGraphWorkspace(raw: unknown): EvidenceGraphWorkspace | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.evidenceGraphWorkspaceId !== "string" || !String(r.evidenceGraphWorkspaceId).trim()) return null;
  if (!Array.isArray(r.graphSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.graphSlots.map(mapSlot).filter((s): s is EvidenceGraphWorkspaceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { evidenceGraphWorkspaceId: String(r.evidenceGraphWorkspaceId).trim(), providerId, graphSlots: slots, governance: { ...EVIDENCE_GRAPH_WORKSPACE_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      clinicalReasoningContextId: String(meta.clinicalReasoningContextId ?? ""),
      evidenceCorrelationWorkspaceId: String(meta.evidenceCorrelationWorkspaceId ?? ""),
      evidenceMappingId: String(meta.evidenceMappingId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): EvidenceGraphWorkspaceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "evidence_graph_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "evidence_graph_slot", status: slot.status, slotKey: slot.slotKey };
}
