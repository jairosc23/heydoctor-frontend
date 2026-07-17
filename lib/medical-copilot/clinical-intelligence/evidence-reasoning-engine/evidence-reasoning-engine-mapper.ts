import { EVIDENCE_REASONING_ENGINE_GOVERNANCE, type EvidenceReasoningEngine, type EvidenceReasoningEngineBuilderResult, type EvidenceReasoningEngineSlot, type AiLayerProviderId } from "./evidence-reasoning-engine";
export function mapEvidenceReasoningEngineEnvelope(payload: unknown): EvidenceReasoningEngineBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "evidence_reasoning_engine" ? root : root.evidenceReasoningEngine && typeof root.evidenceReasoningEngine === "object" && (root.evidenceReasoningEngine as { source?: string }).source === "evidence_reasoning_engine" ? (root.evidenceReasoningEngine as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapEvidenceReasoningEngine(resultObj.evidenceReasoningEngine);
  if (!mapped) return null;
  return { source: "evidence_reasoning_engine", builderVersion: "1.0.0", evidenceReasoningEngine: mapped, governance: { ...EVIDENCE_REASONING_ENGINE_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapEvidenceReasoningEngine(raw: unknown): EvidenceReasoningEngine | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.evidenceReasoningEngineId !== "string" || !String(r.evidenceReasoningEngineId).trim()) return null;
  if (!Array.isArray(r.evidenceReasoningSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.evidenceReasoningSlots.map(mapSlot).filter((s): s is EvidenceReasoningEngineSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { evidenceReasoningEngineId: String(r.evidenceReasoningEngineId).trim(), providerId, evidenceReasoningSlots: slots, governance: { ...EVIDENCE_REASONING_ENGINE_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      differentialReasoningEngineId: String(meta.differentialReasoningEngineId ?? ""),
      evidenceGraphWorkspaceId: String(meta.evidenceGraphWorkspaceId ?? ""),
      confidenceId: String(meta.confidenceId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): EvidenceReasoningEngineSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "evidence_reasoning_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "evidence_reasoning_slot", status: slot.status, slotKey: slot.slotKey };
}
