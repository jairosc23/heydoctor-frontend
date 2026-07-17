import {
  GOVERNED_CLINICAL_REVIEW_PACKAGE_GOVERNANCE,
  type GovernedClinicalReviewPackageComponentKey,
  type GovernedClinicalReviewPackageComponentPresence,
  type GovernedClinicalReviewPackageResult,
} from "./governed-clinical-review-package";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalReviewPackageComponentKey;
  label: string;
}> = [
  { key: "pendingActions", label: "Pending Actions" },
  { key: "reviewSession", label: "Review Session" },
  { key: "consultationExperience", label: "Consultation Experience" },
];

export function mapGovernedClinicalReviewPackageEnvelope(
  payload: unknown,
): GovernedClinicalReviewPackageResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.pendingActions !== undefined ||
    root.reviewSession !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalReviewPackageComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    pendingActions: data.pendingActions ?? null,
    reviewSession: data.reviewSession ?? null,
    consultationExperience: data.consultationExperience ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_REVIEW_PACKAGE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
