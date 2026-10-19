import { CLINICAL_HYPOTHESIS_WORKSPACE_GOVERNANCE, type ClinicalHypothesisWorkspace, type ClinicalHypothesisWorkspaceBuilderResult, type ClinicalHypothesisWorkspaceSlot, type AiLayerProviderId } from "./clinical-hypothesis-workspace";
export function mapClinicalHypothesisWorkspaceEnvelope(payload: unknown): ClinicalHypothesisWorkspaceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "clinical_hypothesis_workspace" ? root : root.clinicalHypothesisWorkspace && typeof root.clinicalHypothesisWorkspace === "object" && (root.clinicalHypothesisWorkspace as { source?: string }).source === "clinical_hypothesis_workspace" ? (root.clinicalHypothesisWorkspace as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapClinicalHypothesisWorkspace(resultObj.clinicalHypothesisWorkspace);
  if (!mapped) return null;
  return { source: "clinical_hypothesis_workspace", builderVersion: "1.0.0", clinicalHypothesisWorkspace: mapped, governance: { ...CLINICAL_HYPOTHESIS_WORKSPACE_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapClinicalHypothesisWorkspace(raw: unknown): ClinicalHypothesisWorkspace | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalHypothesisWorkspaceId !== "string" || !String(r.clinicalHypothesisWorkspaceId).trim()) return null;
  if (!Array.isArray(r.hypothesisSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.hypothesisSlots.map(mapSlot).filter((s): s is ClinicalHypothesisWorkspaceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalHypothesisWorkspaceId: String(r.clinicalHypothesisWorkspaceId).trim(), providerId, hypothesisSlots: slots, governance: { ...CLINICAL_HYPOTHESIS_WORKSPACE_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      governedReasoningOutputId: String(meta.governedReasoningOutputId ?? ""),
      differentialReasoningEngineId: String(meta.differentialReasoningEngineId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ClinicalHypothesisWorkspaceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "hypothesis_workspace_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "hypothesis_workspace_slot", status: slot.status, slotKey: slot.slotKey };
}
