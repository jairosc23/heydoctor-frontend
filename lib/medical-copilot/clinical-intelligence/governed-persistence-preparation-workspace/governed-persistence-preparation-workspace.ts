export const GOVERNED_PERSISTENCE_PREPARATION_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistencePreparationWorkspaceGovernance = typeof GOVERNED_PERSISTENCE_PREPARATION_WORKSPACE_GOVERNANCE;

export type GovernedPersistencePreparationWorkspaceComponentKey =
  | "clinicalActivationPackage"
  | "physicianRuntimePackage";

export type GovernedPersistencePreparationWorkspaceComponentPresence = {
  key: GovernedPersistencePreparationWorkspaceComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistencePreparationWorkspaceResult = {
  clinicalActivationPackage: unknown;
  physicianRuntimePackage: unknown;
  components: GovernedPersistencePreparationWorkspaceComponentPresence[];
  governance: GovernedPersistencePreparationWorkspaceGovernance;
  reason: string | null;
};
