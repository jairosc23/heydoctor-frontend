import { EVIDENCE_RANKING_WORKSPACE_GOVERNANCE, type EvidenceRankingWorkspace, type EvidenceRankingWorkspaceBuilderResult, type EvidenceRankingWorkspaceSlot, type AiLayerProviderId } from "./evidence-ranking-workspace";
export function mapEvidenceRankingWorkspaceEnvelope(payload: unknown): EvidenceRankingWorkspaceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "evidence_ranking_workspace" ? root : root.evidenceRankingWorkspace && typeof root.evidenceRankingWorkspace === "object" && (root.evidenceRankingWorkspace as { source?: string }).source === "evidence_ranking_workspace" ? (root.evidenceRankingWorkspace as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapEvidenceRankingWorkspace(resultObj.evidenceRankingWorkspace);
  if (!mapped) return null;
  return { source: "evidence_ranking_workspace", builderVersion: "1.0.0", evidenceRankingWorkspace: mapped, governance: { ...EVIDENCE_RANKING_WORKSPACE_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapEvidenceRankingWorkspace(raw: unknown): EvidenceRankingWorkspace | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.evidenceRankingWorkspaceId !== "string" || !String(r.evidenceRankingWorkspaceId).trim()) return null;
  if (!Array.isArray(r.rankingSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.rankingSlots.map(mapSlot).filter((s): s is EvidenceRankingWorkspaceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { evidenceRankingWorkspaceId: String(r.evidenceRankingWorkspaceId).trim(), providerId, rankingSlots: slots, governance: { ...EVIDENCE_RANKING_WORKSPACE_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      clinicalHypothesisWorkspaceId: String(meta.clinicalHypothesisWorkspaceId ?? ""),
      evidenceReasoningEngineId: String(meta.evidenceReasoningEngineId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): EvidenceRankingWorkspaceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "evidence_ranking_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "evidence_ranking_slot", status: slot.status, slotKey: slot.slotKey };
}
