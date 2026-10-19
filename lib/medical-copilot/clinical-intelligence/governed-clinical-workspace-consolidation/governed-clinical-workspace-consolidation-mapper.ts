import {
  GOVERNED_CLINICAL_WORKSPACE_CONSOLIDATION_GOVERNANCE,
  type GovernedClinicalWorkspaceConsolidationComponentKey,
  type GovernedClinicalWorkspaceConsolidationComponentPresence,
  type GovernedClinicalWorkspaceConsolidationResult,
} from "./governed-clinical-workspace-consolidation";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalWorkspaceConsolidationComponentKey;
  label: string;
}> = [
  { key: "clinicalWorkspaceSnapshot", label: "Clinical Workspace Snapshot" },
  { key: "encounterConsolidation", label: "Encounter Consolidation" },
];

export function mapGovernedClinicalWorkspaceConsolidationEnvelope(
  payload: unknown,
): GovernedClinicalWorkspaceConsolidationResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalWorkspaceSnapshot !== undefined ||
    root.encounterConsolidation !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalWorkspaceConsolidationComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    clinicalWorkspaceSnapshot: data.clinicalWorkspaceSnapshot ?? null,
    encounterConsolidation: data.encounterConsolidation ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_WORKSPACE_CONSOLIDATION_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
