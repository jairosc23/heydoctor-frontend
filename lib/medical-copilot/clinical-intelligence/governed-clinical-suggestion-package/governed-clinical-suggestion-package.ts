export const GOVERNED_CLINICAL_SUGGESTIONS_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
};

export type GovernedClinicalSuggestionPackageGovernance = typeof GOVERNED_CLINICAL_SUGGESTIONS_UI_GOVERNANCE;

export type GovernedClinicalSuggestionPackageComponentKey =
  | "runtime"
  | "suggestions"
  | "governance"
  | "hitl";

export type GovernedClinicalSuggestionPackageComponentPresence = {
  key: GovernedClinicalSuggestionPackageComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedClinicalSuggestionPackageResult = {
  payload: unknown;
  status: string | null;
  title: string | null;
  itemCount: number;
  components: GovernedClinicalSuggestionPackageComponentPresence[];
  governance: GovernedClinicalSuggestionPackageGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
  repositoryInvoked: false;
  executesAction: false;
  draftApproved: false;
};
