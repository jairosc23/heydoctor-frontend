import {
  GOVERNED_DRAFT_COMPARISON_WORKSPACE_GOVERNANCE,
  type GovernedDraftComparisonWorkspaceComponentKey,
  type GovernedDraftComparisonWorkspaceComponentPresence,
  type GovernedDraftComparisonWorkspaceResult,
} from "./governed-draft-comparison-workspace";

const COMPONENT_DEFS: Array<{
  key: GovernedDraftComparisonWorkspaceComponentKey;
  label: string;
}> = [
  { key: "draftReviewWorkspace", label: "Draft Review Workspace" },
  { key: "clinicalDocumentationPackage", label: "Clinical Documentation Package" },
];

export function mapGovernedDraftComparisonWorkspaceEnvelope(
  payload: unknown,
): GovernedDraftComparisonWorkspaceResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.draftReviewWorkspace !== undefined ||
    root.clinicalDocumentationPackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedDraftComparisonWorkspaceComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    draftReviewWorkspace: data.draftReviewWorkspace ?? null,
    clinicalDocumentationPackage: data.clinicalDocumentationPackage ?? null,
    components,
    governance: { ...GOVERNED_DRAFT_COMPARISON_WORKSPACE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
