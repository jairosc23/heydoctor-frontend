export const GOVERNED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
};

export type GovernedPreventiveCareSuggestionsGovernance = typeof GOVERNED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE;

export type GovernedPreventiveCareSuggestionsComponentKey = "preventive" | "intelligence" | "governance" | "hitl";

export type GovernedPreventiveCareSuggestionsComponentPresence = {
  key: GovernedPreventiveCareSuggestionsComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedPreventiveCareSuggestionsResult = {
  payload: unknown;
  status: string | null;
  title: string | null;
  itemCount: number;
  components: GovernedPreventiveCareSuggestionsComponentPresence[];
  governance: GovernedPreventiveCareSuggestionsGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
  repositoryInvoked: false;
  executesAction: false;
  draftApproved: false;
  automaticDecision: false;
};
