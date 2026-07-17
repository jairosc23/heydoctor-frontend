export const GOVERNED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
};

export type GovernedPreventiveScreeningSuggestionsGovernance = typeof GOVERNED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE;

export type GovernedPreventiveScreeningSuggestionsComponentKey = "screening" | "intelligence" | "governance" | "hitl";

export type GovernedPreventiveScreeningSuggestionsComponentPresence = {
  key: GovernedPreventiveScreeningSuggestionsComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedPreventiveScreeningSuggestionsResult = {
  payload: unknown;
  status: string | null;
  title: string | null;
  itemCount: number;
  components: GovernedPreventiveScreeningSuggestionsComponentPresence[];
  governance: GovernedPreventiveScreeningSuggestionsGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
  repositoryInvoked: false;
  executesAction: false;
  draftApproved: false;
  automaticDecision: false;
};
