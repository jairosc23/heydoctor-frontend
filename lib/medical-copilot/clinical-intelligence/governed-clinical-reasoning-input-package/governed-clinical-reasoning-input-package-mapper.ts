import { GOVERNED_CLINICAL_REASONING_INPUT_PACKAGE_GOVERNANCE, type GovernedClinicalReasoningInputPackage, type GovernedClinicalReasoningInputPackageBuilderResult, type GovernedClinicalReasoningInputPackageSlot, type AiLayerProviderId } from "./governed-clinical-reasoning-input-package";
export function mapGovernedClinicalReasoningInputPackageEnvelope(payload: unknown): GovernedClinicalReasoningInputPackageBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "governed_clinical_reasoning_input_package" ? root : root.clinicalReasoningInputPackage && typeof root.clinicalReasoningInputPackage === "object" && (root.clinicalReasoningInputPackage as { source?: string }).source === "governed_clinical_reasoning_input_package" ? (root.clinicalReasoningInputPackage as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapGovernedClinicalReasoningInputPackage(resultObj.clinicalReasoningInputPackage);
  if (!mapped) return null;
  return { source: "governed_clinical_reasoning_input_package", builderVersion: "1.0.0", clinicalReasoningInputPackage: mapped, governance: { ...GOVERNED_CLINICAL_REASONING_INPUT_PACKAGE_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapGovernedClinicalReasoningInputPackage(raw: unknown): GovernedClinicalReasoningInputPackage | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalReasoningInputPackageId !== "string" || !String(r.clinicalReasoningInputPackageId).trim()) return null;
  if (!Array.isArray(r.inputPackageSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.inputPackageSlots.map(mapSlot).filter((s): s is GovernedClinicalReasoningInputPackageSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalReasoningInputPackageId: String(r.clinicalReasoningInputPackageId).trim(), providerId, inputPackageSlots: slots, governance: { ...GOVERNED_CLINICAL_REASONING_INPUT_PACKAGE_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      governedReasoningPreparationId: String(meta.governedReasoningPreparationId ?? ""),
      governedClinicalReasoningDatasetId: String(meta.governedClinicalReasoningDatasetId ?? ""),
      clinicalReasoningPackageId: String(meta.clinicalReasoningPackageId ?? ""),
      reviewSessionId: String(meta.reviewSessionId ?? ""),
      assessmentPackageId: String(meta.assessmentPackageId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): GovernedClinicalReasoningInputPackageSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "reasoning_input_package_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "reasoning_input_package_slot", status: slot.status, slotKey: slot.slotKey };
}
