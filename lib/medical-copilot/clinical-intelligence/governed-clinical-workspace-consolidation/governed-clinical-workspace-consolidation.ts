export const GOVERNED_CLINICAL_WORKSPACE_CONSOLIDATION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalWorkspaceConsolidationGovernance = typeof GOVERNED_CLINICAL_WORKSPACE_CONSOLIDATION_GOVERNANCE;

export type GovernedClinicalWorkspaceConsolidationComponentKey =
  | "clinicalWorkspaceSnapshot"
  | "encounterConsolidation";

export type GovernedClinicalWorkspaceConsolidationComponentPresence = {
  key: GovernedClinicalWorkspaceConsolidationComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalWorkspaceConsolidationResult = {
  clinicalWorkspaceSnapshot: unknown;
  encounterConsolidation: unknown;
  components: GovernedClinicalWorkspaceConsolidationComponentPresence[];
  governance: GovernedClinicalWorkspaceConsolidationGovernance;
  reason: string | null;
};
