import {
  GOVERNED_CLINICAL_ASSISTANCE_GOVERNANCE,
  type GovernedClinicalAssistanceHitl,
  type GovernedClinicalAssistanceResult,
} from "./governed-clinical-assistance";

export function mapGovernedClinicalAssistanceEnvelope(
  payload: unknown,
): GovernedClinicalAssistanceResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.runtime !== undefined ||
    root.clinicalContext !== undefined ||
    root.clinicalPlan !== undefined ||
    root.decisionWorkspace !== undefined ||
    root.reviewSession !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const hasPackage =
    data.runtime != null ||
    data.clinicalContext != null ||
    data.clinicalPlan != null ||
    data.clinicalOutput != null ||
    data.decisionWorkspace != null ||
    data.reviewSession != null;
  if (!hasPackage && data.governance == null) return null;

  const hitl: GovernedClinicalAssistanceHitl = {
    requiresPhysicianReview: true,
    executesAction: false,
    autoPersistedToEmr: false,
    status: "awaiting_physician_review",
  };

  return {
    runtime: data.runtime ?? null,
    clinicalContext: data.clinicalContext ?? null,
    clinicalPlan: data.clinicalPlan ?? null,
    clinicalOutput: data.clinicalOutput ?? null,
    decisionWorkspace: data.decisionWorkspace ?? null,
    reviewSession: data.reviewSession ?? null,
    governance: { ...GOVERNED_CLINICAL_ASSISTANCE_GOVERNANCE },
    hitl,
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
