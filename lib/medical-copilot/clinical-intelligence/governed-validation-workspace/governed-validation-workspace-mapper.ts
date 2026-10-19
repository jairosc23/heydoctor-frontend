import {
  GOVERNED_VALIDATION_WORKSPACE_GOVERNANCE,
  type GovernedValidationWorkspaceComponentKey,
  type GovernedValidationWorkspaceComponentPresence,
  type GovernedValidationWorkspaceResult,
} from "./governed-validation-workspace";

const COMPONENT_DEFS: Array<{
  key: GovernedValidationWorkspaceComponentKey;
  label: string;
}> = [
  { key: "draftComparison", label: "Draft Comparison" },
  { key: "reviewSession", label: "Review Session" },
];

export function mapGovernedValidationWorkspaceEnvelope(
  payload: unknown,
): GovernedValidationWorkspaceResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.draftComparison !== undefined ||
    root.reviewSession !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedValidationWorkspaceComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    draftComparison: data.draftComparison ?? null,
    reviewSession: data.reviewSession ?? null,
    components,
    governance: { ...GOVERNED_VALIDATION_WORKSPACE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
