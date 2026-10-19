import {
  GOVERNED_CLINICAL_WORKSPACE_SNAPSHOT_GOVERNANCE,
  type GovernedClinicalWorkspaceSnapshotComponentKey,
  type GovernedClinicalWorkspaceSnapshotComponentPresence,
  type GovernedClinicalWorkspaceSnapshotResult,
} from "./governed-clinical-workspace-snapshot";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalWorkspaceSnapshotComponentKey;
  label: string;
}> = [
  { key: "clinicalWorkspaceReview", label: "Clinical Workspace Review" },
  { key: "consultationSnapshot", label: "Consultation Snapshot" },
];

export function mapGovernedClinicalWorkspaceSnapshotEnvelope(
  payload: unknown,
): GovernedClinicalWorkspaceSnapshotResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalWorkspaceReview !== undefined ||
    root.consultationSnapshot !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalWorkspaceSnapshotComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    clinicalWorkspaceReview: data.clinicalWorkspaceReview ?? null,
    consultationSnapshot: data.consultationSnapshot ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_WORKSPACE_SNAPSHOT_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
