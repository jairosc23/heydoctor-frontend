export const GOVERNED_CLINICAL_SUGGESTIONS_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
};

export type GovernedClinicalSuggestionRuntimeGovernance = typeof GOVERNED_CLINICAL_SUGGESTIONS_UI_GOVERNANCE;

export type GovernedClinicalSuggestionRuntimeComponentKey =
  | "runtime"
  | "suggestions"
  | "governance"
  | "hitl";

export type GovernedClinicalSuggestionRuntimeComponentPresence = {
  key: GovernedClinicalSuggestionRuntimeComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedClinicalSuggestionRuntimeResult = {
  payload: unknown;
  status: string | null;
  title: string | null;
  itemCount: number;
  components: GovernedClinicalSuggestionRuntimeComponentPresence[];
  governance: GovernedClinicalSuggestionRuntimeGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
  repositoryInvoked: false;
  executesAction: false;
  draftApproved: false;
};
