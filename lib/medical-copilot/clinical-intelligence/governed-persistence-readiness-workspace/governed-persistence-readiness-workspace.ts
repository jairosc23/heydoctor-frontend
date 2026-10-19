export const GOVERNED_PERSISTENCE_READINESS_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistenceReadinessWorkspaceGovernance = typeof GOVERNED_PERSISTENCE_READINESS_WORKSPACE_GOVERNANCE;

export type GovernedPersistenceReadinessWorkspaceComponentKey =
  | "persistencePackage"
  | "clinicalActivationPackage";

export type GovernedPersistenceReadinessWorkspaceComponentPresence = {
  key: GovernedPersistenceReadinessWorkspaceComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistenceReadinessWorkspaceResult = {
  persistencePackage: unknown;
  clinicalActivationPackage: unknown;
  components: GovernedPersistenceReadinessWorkspaceComponentPresence[];
  governance: GovernedPersistenceReadinessWorkspaceGovernance;
  reason: string | null;
};
