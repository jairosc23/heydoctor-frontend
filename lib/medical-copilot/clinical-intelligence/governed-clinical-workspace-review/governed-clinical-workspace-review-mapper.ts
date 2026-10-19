import {
  GOVERNED_CLINICAL_WORKSPACE_REVIEW_GOVERNANCE,
  type GovernedClinicalWorkspaceReviewComponentKey,
  type GovernedClinicalWorkspaceReviewComponentPresence,
  type GovernedClinicalWorkspaceReviewResult,
} from "./governed-clinical-workspace-review";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalWorkspaceReviewComponentKey;
  label: string;
}> = [
  { key: "clinicalWorkspace", label: "Clinical Workspace" },
  { key: "reviewSession", label: "Review Session" },
  { key: "physicianWorkspace", label: "Physician Workspace" },
];

export function mapGovernedClinicalWorkspaceReviewEnvelope(
  payload: unknown,
): GovernedClinicalWorkspaceReviewResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalWorkspace !== undefined ||
    root.reviewSession !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalWorkspaceReviewComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    clinicalWorkspace: data.clinicalWorkspace ?? null,
    reviewSession: data.reviewSession ?? null,
    physicianWorkspace: data.physicianWorkspace ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_WORKSPACE_REVIEW_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
