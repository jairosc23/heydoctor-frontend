import {
  GOVERNED_DRAFT_REVIEW_WORKSPACE_GOVERNANCE,
  type GovernedDraftReviewWorkspaceComponentKey,
  type GovernedDraftReviewWorkspaceComponentPresence,
  type GovernedDraftReviewWorkspaceResult,
} from "./governed-draft-review-workspace";

const COMPONENT_DEFS: Array<{
  key: GovernedDraftReviewWorkspaceComponentKey;
  label: string;
}> = [
  { key: "documentationPackage", label: "Documentation Package" },
  { key: "physicianInteractionWorkspace", label: "Physician Interaction Workspace" },
];

export function mapGovernedDraftReviewWorkspaceEnvelope(
  payload: unknown,
): GovernedDraftReviewWorkspaceResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.documentationPackage !== undefined ||
    root.physicianInteractionWorkspace !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedDraftReviewWorkspaceComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    documentationPackage: data.documentationPackage ?? null,
    physicianInteractionWorkspace: data.physicianInteractionWorkspace ?? null,
    components,
    governance: { ...GOVERNED_DRAFT_REVIEW_WORKSPACE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
