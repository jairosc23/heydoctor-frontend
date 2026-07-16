import {
  GOVERNED_CLINICAL_ASSESSMENT_PACKAGE_GOVERNANCE,
  type GovernedClinicalAssessmentPackage,
  type GovernedClinicalAssessmentPackageBuilderResult,
  type GovernedClinicalAssessmentPackageSlot,
  type AiLayerProviderId,
} from "./governed-clinical-assessment-package";

export function mapGovernedClinicalAssessmentPackageEnvelope(payload: unknown): GovernedClinicalAssessmentPackageBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "governed_clinical_assessment_package"
      ? root
      : root.assessmentPackage && typeof root.assessmentPackage === "object" &&
          (root.assessmentPackage as { source?: string }).source === "governed_clinical_assessment_package"
        ? (root.assessmentPackage as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapGovernedClinicalAssessmentPackage(resultObj.assessmentPackage);
  if (!mapped) return null;
  return {
    source: "governed_clinical_assessment_package",
    builderVersion: "1.0.0",
    assessmentPackage: mapped,
    governance: { ...GOVERNED_CLINICAL_ASSESSMENT_PACKAGE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapGovernedClinicalAssessmentPackage(raw: unknown): GovernedClinicalAssessmentPackage | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.assessmentPackageId !== "string" || !String(r.assessmentPackageId).trim()) return null;
  if (!Array.isArray(r.packageSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.packageSlots.map(mapSlot).filter((s): s is GovernedClinicalAssessmentPackageSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    assessmentPackageId: String(r.assessmentPackageId).trim(),
    providerId,
    packageSlots: slots,
    governance: { ...GOVERNED_CLINICAL_ASSESSMENT_PACKAGE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      reviewSessionId: String(meta.reviewSessionId ?? ""),
      interviewWorkspaceId: String(meta.interviewWorkspaceId ?? ""),
      clinicalQuestionsId: String(meta.clinicalQuestionsId ?? ""),
      completenessId: String(meta.completenessId ?? ""),
      readinessWorkspaceId: String(meta.readinessWorkspaceId ?? ""),
      confidenceId: String(meta.confidenceId ?? ""),
      clinicalPlanId: String(meta.clinicalPlanId ?? ""),
      contextId: String(meta.contextId ?? ""),
      evidenceMappingId: String(meta.evidenceMappingId ?? ""),
      reviewId: String(meta.reviewId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): GovernedClinicalAssessmentPackageSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "assessment_package_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "assessment_package_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
