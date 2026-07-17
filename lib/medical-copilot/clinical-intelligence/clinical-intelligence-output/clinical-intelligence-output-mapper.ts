import { CLINICAL_INTELLIGENCE_OUTPUT_GOVERNANCE, type ClinicalIntelligenceOutput, type ClinicalIntelligenceOutputBuilderResult, type ClinicalIntelligenceOutputSlot, type AiLayerProviderId } from "./clinical-intelligence-output";
export function mapClinicalIntelligenceOutputEnvelope(payload: unknown): ClinicalIntelligenceOutputBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "clinical_intelligence_output" ? root : root.clinicalIntelligenceOutput && typeof root.clinicalIntelligenceOutput === "object" && (root.clinicalIntelligenceOutput as { source?: string }).source === "clinical_intelligence_output" ? (root.clinicalIntelligenceOutput as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapClinicalIntelligenceOutput(resultObj.clinicalIntelligenceOutput);
  if (!mapped) return null;
  return { source: "clinical_intelligence_output", builderVersion: "1.0.0", clinicalIntelligenceOutput: mapped, governance: { ...CLINICAL_INTELLIGENCE_OUTPUT_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapClinicalIntelligenceOutput(raw: unknown): ClinicalIntelligenceOutput | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalIntelligenceOutputId !== "string" || !String(r.clinicalIntelligenceOutputId).trim()) return null;
  if (!Array.isArray(r.outputSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.outputSlots.map(mapSlot).filter((s): s is ClinicalIntelligenceOutputSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalIntelligenceOutputId: String(r.clinicalIntelligenceOutputId).trim(), providerId, outputSlots: slots, governance: { ...CLINICAL_INTELLIGENCE_OUTPUT_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      governedClinicalIntelligenceSessionId: String(meta.governedClinicalIntelligenceSessionId ?? ""),
      clinicalIntelligenceRuntimeId: String(meta.clinicalIntelligenceRuntimeId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ClinicalIntelligenceOutputSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "ci_output_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "ci_output_slot", status: slot.status, slotKey: slot.slotKey };
}
