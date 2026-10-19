export const GOVERNED_CLINICAL_WORKSPACE_SNAPSHOT_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalWorkspaceSnapshotGovernance = typeof GOVERNED_CLINICAL_WORKSPACE_SNAPSHOT_GOVERNANCE;

export type GovernedClinicalWorkspaceSnapshotComponentKey =
  | "clinicalWorkspaceReview"
  | "consultationSnapshot";

export type GovernedClinicalWorkspaceSnapshotComponentPresence = {
  key: GovernedClinicalWorkspaceSnapshotComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalWorkspaceSnapshotResult = {
  clinicalWorkspaceReview: unknown;
  consultationSnapshot: unknown;
  components: GovernedClinicalWorkspaceSnapshotComponentPresence[];
  governance: GovernedClinicalWorkspaceSnapshotGovernance;
  reason: string | null;
};
