import {
  GOVERNED_PHYSICIAN_REVIEW_PACKAGE_GOVERNANCE,
  type GovernedPhysicianReviewPackage,
  type GovernedPhysicianReviewPackageBuilderResult,
  type GovernedPhysicianReviewPackageSlot,
  type AiLayerProviderId,
} from "./governed-physician-review-package";

export function mapGovernedPhysicianReviewPackageEnvelope(payload: unknown): GovernedPhysicianReviewPackageBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "governed_physician_review_package"
      ? root
      : root.physicianReviewPackage && typeof root.physicianReviewPackage === "object" &&
          (root.physicianReviewPackage as { source?: string }).source === "governed_physician_review_package"
        ? (root.physicianReviewPackage as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapGovernedPhysicianReviewPackage(resultObj.physicianReviewPackage);
  if (!mapped) return null;
  return {
    source: "governed_physician_review_package",
    builderVersion: "1.0.0",
    physicianReviewPackage: mapped,
    governance: { ...GOVERNED_PHYSICIAN_REVIEW_PACKAGE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapGovernedPhysicianReviewPackage(raw: unknown): GovernedPhysicianReviewPackage | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.physicianReviewPackageId !== "string" || !String(r.physicianReviewPackageId).trim()) return null;
  if (!Array.isArray(r.packageSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.packageSlots.map(mapSlot).filter((s): s is GovernedPhysicianReviewPackageSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    physicianReviewPackageId: String(r.physicianReviewPackageId).trim(),
    providerId,
    packageSlots: slots,
    governance: { ...GOVERNED_PHYSICIAN_REVIEW_PACKAGE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      reviewDatasetId: String(meta.reviewDatasetId ?? ""),
      checklistId: String(meta.checklistId ?? ""),
      validationWorkspaceId: String(meta.validationWorkspaceId ?? ""),
      reviewSummaryId: String(meta.reviewSummaryId ?? ""),
      sessionPackageId: String(meta.sessionPackageId ?? ""),
      contextId: String(meta.contextId ?? ""),
      clinicalPlanId: String(meta.clinicalPlanId ?? ""),
      reviewId: String(meta.reviewId ?? ""),
      caseId: String(meta.caseId ?? ""),
      workspaceId: String(meta.workspaceId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): GovernedPhysicianReviewPackageSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "physician_review_package_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "physician_review_package_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
