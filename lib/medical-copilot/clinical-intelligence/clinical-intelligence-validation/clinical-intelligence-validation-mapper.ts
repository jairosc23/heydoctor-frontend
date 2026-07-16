import { CLINICAL_INTELLIGENCE_VALIDATION_GOVERNANCE, type ClinicalIntelligenceValidation, type ClinicalIntelligenceValidationBuilderResult, type ClinicalIntelligenceValidationSlot, type AiLayerProviderId } from "./clinical-intelligence-validation";
export function mapClinicalIntelligenceValidationEnvelope(payload: unknown): ClinicalIntelligenceValidationBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "clinical_intelligence_validation" ? root : root.clinicalIntelligenceValidation && typeof root.clinicalIntelligenceValidation === "object" && (root.clinicalIntelligenceValidation as { source?: string }).source === "clinical_intelligence_validation" ? (root.clinicalIntelligenceValidation as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapClinicalIntelligenceValidation(resultObj.clinicalIntelligenceValidation);
  if (!mapped) return null;
  return { source: "clinical_intelligence_validation", builderVersion: "1.0.0", clinicalIntelligenceValidation: mapped, governance: { ...CLINICAL_INTELLIGENCE_VALIDATION_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapClinicalIntelligenceValidation(raw: unknown): ClinicalIntelligenceValidation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalIntelligenceValidationId !== "string" || !String(r.clinicalIntelligenceValidationId).trim()) return null;
  if (!Array.isArray(r.validationSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.validationSlots.map(mapSlot).filter((s): s is ClinicalIntelligenceValidationSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalIntelligenceValidationId: String(r.clinicalIntelligenceValidationId).trim(), providerId, validationSlots: slots, governance: { ...CLINICAL_INTELLIGENCE_VALIDATION_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      physicianIntelligenceWorkspaceId: String(meta.physicianIntelligenceWorkspaceId ?? ""),
      clinicalConsistencyEngineId: String(meta.clinicalConsistencyEngineId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ClinicalIntelligenceValidationSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "ci_validation_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "ci_validation_slot", status: slot.status, slotKey: slot.slotKey };
}
