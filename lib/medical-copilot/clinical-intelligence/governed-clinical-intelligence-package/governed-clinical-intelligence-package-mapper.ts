import {
  GOVERNED_CLINICAL_INTELLIGENCE_PACKAGE_GOVERNANCE,
  type GovernedClinicalIntelligencePackage,
  type GovernedClinicalIntelligencePackageBuilderResult,
  type GovernedClinicalIntelligencePackageSlot,
  type AiLayerProviderId,
} from "./governed-clinical-intelligence-package";

export function mapGovernedClinicalIntelligencePackageEnvelope(payload: unknown): GovernedClinicalIntelligencePackageBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "governed_clinical_intelligence_package"
      ? root
      : root.governedClinicalIntelligencePackage && typeof root.governedClinicalIntelligencePackage === "object" &&
          (root.governedClinicalIntelligencePackage as { source?: string }).source === "governed_clinical_intelligence_package"
        ? (root.governedClinicalIntelligencePackage as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapGovernedClinicalIntelligencePackage(resultObj.governedClinicalIntelligencePackage);
  if (!mapped) return null;
  return {
    source: "governed_clinical_intelligence_package",
    builderVersion: "1.0.0",
    governedClinicalIntelligencePackage: mapped,
    governance: { ...GOVERNED_CLINICAL_INTELLIGENCE_PACKAGE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapGovernedClinicalIntelligencePackage(raw: unknown): GovernedClinicalIntelligencePackage | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.governedClinicalIntelligencePackageId !== "string" || !String(r.governedClinicalIntelligencePackageId).trim()) return null;
  if (!Array.isArray(r.intelligencePackageSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.intelligencePackageSlots.map(mapSlot).filter((s): s is GovernedClinicalIntelligencePackageSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    governedClinicalIntelligencePackageId: String(r.governedClinicalIntelligencePackageId).trim(),
    providerId,
    intelligencePackageSlots: slots,
    governance: { ...GOVERNED_CLINICAL_INTELLIGENCE_PACKAGE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      physicianReasoningReviewId: String(meta.physicianReasoningReviewId ?? ""),
      governedReasoningOutputId: String(meta.governedReasoningOutputId ?? ""),
      clinicalReasoningPackageId: String(meta.clinicalReasoningPackageId ?? ""),
      assessmentPackageId: String(meta.assessmentPackageId ?? ""),
      reviewSessionId: String(meta.reviewSessionId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): GovernedClinicalIntelligencePackageSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "clinical_intelligence_package_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "clinical_intelligence_package_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
