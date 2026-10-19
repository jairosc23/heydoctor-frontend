export const GOVERNED_ENCOUNTER_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedEncounterWorkspaceGovernance = typeof GOVERNED_ENCOUNTER_WORKSPACE_GOVERNANCE;

export type GovernedEncounterWorkspaceComponentKey =
  | "consultationWorkspace"
  | "documentationPackage";

export type GovernedEncounterWorkspaceComponentPresence = {
  key: GovernedEncounterWorkspaceComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedEncounterWorkspaceResult = {
  consultationWorkspace: unknown;
  documentationPackage: unknown;
  components: GovernedEncounterWorkspaceComponentPresence[];
  governance: GovernedEncounterWorkspaceGovernance;
  reason: string | null;
};
