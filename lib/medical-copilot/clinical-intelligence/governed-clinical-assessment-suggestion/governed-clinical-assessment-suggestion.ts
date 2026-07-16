export const GOVERNED_CLINICAL_SUGGESTIONS_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
};

export type GovernedClinicalAssessmentSuggestionGovernance = typeof GOVERNED_CLINICAL_SUGGESTIONS_UI_GOVERNANCE;

export type GovernedClinicalAssessmentSuggestionComponentKey =
  | "runtime"
  | "suggestions"
  | "governance"
  | "hitl";

export type GovernedClinicalAssessmentSuggestionComponentPresence = {
  key: GovernedClinicalAssessmentSuggestionComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedClinicalAssessmentSuggestionResult = {
  payload: unknown;
  status: string | null;
  title: string | null;
  itemCount: number;
  components: GovernedClinicalAssessmentSuggestionComponentPresence[];
  governance: GovernedClinicalAssessmentSuggestionGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
  repositoryInvoked: false;
  executesAction: false;
  draftApproved: false;
};
