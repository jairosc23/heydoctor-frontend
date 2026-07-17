import { CLINICAL_REASONING_PACKAGE_GOVERNANCE, type ClinicalReasoningPackage, type ClinicalReasoningPackageBuilderResult, type ClinicalReasoningPackageSlot, type AiLayerProviderId } from "./clinical-reasoning-package";
export function mapClinicalReasoningPackageEnvelope(payload: unknown): ClinicalReasoningPackageBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "clinical_reasoning_package" ? root : root.clinicalReasoningPackage && typeof root.clinicalReasoningPackage === "object" && (root.clinicalReasoningPackage as { source?: string }).source === "clinical_reasoning_package" ? (root.clinicalReasoningPackage as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapClinicalReasoningPackage(resultObj.clinicalReasoningPackage);
  if (!mapped) return null;
  return { source: "clinical_reasoning_package", builderVersion: "1.0.0", clinicalReasoningPackage: mapped, governance: { ...CLINICAL_REASONING_PACKAGE_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapClinicalReasoningPackage(raw: unknown): ClinicalReasoningPackage | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalReasoningPackageId !== "string" || !String(r.clinicalReasoningPackageId).trim()) return null;
  if (!Array.isArray(r.packageSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.packageSlots.map(mapSlot).filter((s): s is ClinicalReasoningPackageSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalReasoningPackageId: String(r.clinicalReasoningPackageId).trim(), providerId, packageSlots: slots, governance: { ...CLINICAL_REASONING_PACKAGE_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      governedClinicalReasoningSessionId: String(meta.governedClinicalReasoningSessionId ?? ""),
      clinicalReasoningRuntimeFoundationId: String(meta.clinicalReasoningRuntimeFoundationId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ClinicalReasoningPackageSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "reasoning_package_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "reasoning_package_slot", status: slot.status, slotKey: slot.slotKey };
}
