export const GOVERNED_CLINICAL_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalWorkspaceGovernance = typeof GOVERNED_CLINICAL_WORKSPACE_GOVERNANCE;

export type GovernedClinicalWorkspaceComponentKey =
  | "consultationPackage"
  | "clinicalEncounter"
  | "documentationPackage";

export type GovernedClinicalWorkspaceComponentPresence = {
  key: GovernedClinicalWorkspaceComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalWorkspaceResult = {
  consultationPackage: unknown;
  clinicalEncounter: unknown;
  documentationPackage: unknown;
  components: GovernedClinicalWorkspaceComponentPresence[];
  governance: GovernedClinicalWorkspaceGovernance;
  reason: string | null;
};
