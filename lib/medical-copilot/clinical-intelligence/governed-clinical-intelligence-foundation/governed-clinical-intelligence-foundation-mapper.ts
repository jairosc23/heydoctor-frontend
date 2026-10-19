import { GOVERNED_CLINICAL_INTELLIGENCE_FOUNDATION_GOVERNANCE, type GovernedClinicalIntelligenceFoundation, type GovernedClinicalIntelligenceFoundationBuilderResult, type GovernedClinicalIntelligenceFoundationSlot, type AiLayerProviderId } from "./governed-clinical-intelligence-foundation";
export function mapGovernedClinicalIntelligenceFoundationEnvelope(payload: unknown): GovernedClinicalIntelligenceFoundationBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "governed_clinical_intelligence_foundation" ? root : root.governedClinicalIntelligenceFoundation && typeof root.governedClinicalIntelligenceFoundation === "object" && (root.governedClinicalIntelligenceFoundation as { source?: string }).source === "governed_clinical_intelligence_foundation" ? (root.governedClinicalIntelligenceFoundation as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapGovernedClinicalIntelligenceFoundation(resultObj.governedClinicalIntelligenceFoundation);
  if (!mapped) return null;
  return { source: "governed_clinical_intelligence_foundation", builderVersion: "1.0.0", governedClinicalIntelligenceFoundation: mapped, governance: { ...GOVERNED_CLINICAL_INTELLIGENCE_FOUNDATION_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapGovernedClinicalIntelligenceFoundation(raw: unknown): GovernedClinicalIntelligenceFoundation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.governedClinicalIntelligenceFoundationId !== "string" || !String(r.governedClinicalIntelligenceFoundationId).trim()) return null;
  if (!Array.isArray(r.foundationSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.foundationSlots.map(mapSlot).filter((s): s is GovernedClinicalIntelligenceFoundationSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { governedClinicalIntelligenceFoundationId: String(r.governedClinicalIntelligenceFoundationId).trim(), providerId, foundationSlots: slots, governance: { ...GOVERNED_CLINICAL_INTELLIGENCE_FOUNDATION_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      clinicalIntelligenceOutputId: String(meta.clinicalIntelligenceOutputId ?? ""),
      governedClinicalIntelligencePackageId: String(meta.governedClinicalIntelligencePackageId ?? ""),
      clinicalReasoningPackageId: String(meta.clinicalReasoningPackageId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): GovernedClinicalIntelligenceFoundationSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "ci_foundation_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "ci_foundation_slot", status: slot.status, slotKey: slot.slotKey };
}
