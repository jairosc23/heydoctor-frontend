import { CLINICAL_INTELLIGENCE_ORCHESTRATOR_GOVERNANCE, type ClinicalIntelligenceOrchestrator, type ClinicalIntelligenceOrchestratorBuilderResult, type ClinicalIntelligenceOrchestratorSlot, type AiLayerProviderId } from "./clinical-intelligence-orchestrator";
export function mapClinicalIntelligenceOrchestratorEnvelope(payload: unknown): ClinicalIntelligenceOrchestratorBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "clinical_intelligence_orchestrator" ? root : root.clinicalIntelligenceOrchestrator && typeof root.clinicalIntelligenceOrchestrator === "object" && (root.clinicalIntelligenceOrchestrator as { source?: string }).source === "clinical_intelligence_orchestrator" ? (root.clinicalIntelligenceOrchestrator as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapClinicalIntelligenceOrchestrator(resultObj.clinicalIntelligenceOrchestrator);
  if (!mapped) return null;
  return { source: "clinical_intelligence_orchestrator", builderVersion: "1.0.0", clinicalIntelligenceOrchestrator: mapped, governance: { ...CLINICAL_INTELLIGENCE_ORCHESTRATOR_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapClinicalIntelligenceOrchestrator(raw: unknown): ClinicalIntelligenceOrchestrator | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalIntelligenceOrchestratorId !== "string" || !String(r.clinicalIntelligenceOrchestratorId).trim()) return null;
  if (!Array.isArray(r.orchestratorSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.orchestratorSlots.map(mapSlot).filter((s): s is ClinicalIntelligenceOrchestratorSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalIntelligenceOrchestratorId: String(r.clinicalIntelligenceOrchestratorId).trim(), providerId, orchestratorSlots: slots, governance: { ...CLINICAL_INTELLIGENCE_ORCHESTRATOR_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      governedClinicalIntelligencePackageId: String(meta.governedClinicalIntelligencePackageId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ClinicalIntelligenceOrchestratorSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "ci_orchestrator_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "ci_orchestrator_slot", status: slot.status, slotKey: slot.slotKey };
}
