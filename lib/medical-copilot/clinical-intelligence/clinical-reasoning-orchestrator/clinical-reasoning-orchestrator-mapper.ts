import { CLINICAL_REASONING_ORCHESTRATOR_GOVERNANCE, type ClinicalReasoningOrchestrator, type ClinicalReasoningOrchestratorBuilderResult, type ClinicalReasoningOrchestratorSlot, type AiLayerProviderId } from "./clinical-reasoning-orchestrator";
export function mapClinicalReasoningOrchestratorEnvelope(payload: unknown): ClinicalReasoningOrchestratorBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "clinical_reasoning_orchestrator" ? root : root.clinicalReasoningOrchestrator && typeof root.clinicalReasoningOrchestrator === "object" && (root.clinicalReasoningOrchestrator as { source?: string }).source === "clinical_reasoning_orchestrator" ? (root.clinicalReasoningOrchestrator as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapClinicalReasoningOrchestrator(resultObj.clinicalReasoningOrchestrator);
  if (!mapped) return null;
  return { source: "clinical_reasoning_orchestrator", builderVersion: "1.0.0", clinicalReasoningOrchestrator: mapped, governance: { ...CLINICAL_REASONING_ORCHESTRATOR_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapClinicalReasoningOrchestrator(raw: unknown): ClinicalReasoningOrchestrator | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalReasoningOrchestratorId !== "string" || !String(r.clinicalReasoningOrchestratorId).trim()) return null;
  if (!Array.isArray(r.orchestratorSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.orchestratorSlots.map(mapSlot).filter((s): s is ClinicalReasoningOrchestratorSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalReasoningOrchestratorId: String(r.clinicalReasoningOrchestratorId).trim(), providerId, orchestratorSlots: slots, governance: { ...CLINICAL_REASONING_ORCHESTRATOR_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      clinicalReasoningPackageId: String(meta.clinicalReasoningPackageId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ClinicalReasoningOrchestratorSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "orchestrator_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "orchestrator_slot", status: slot.status, slotKey: slot.slotKey };
}
