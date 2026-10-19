export const GOVERNED_CLINICAL_EVIDENCE_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
};

export type GovernedRecommendationValidationGovernance = typeof GOVERNED_CLINICAL_EVIDENCE_UI_GOVERNANCE;

export type GovernedRecommendationValidationComponentKey = "validation" | "evidence" | "governance" | "hitl";

export type GovernedRecommendationValidationComponentPresence = {
  key: GovernedRecommendationValidationComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedRecommendationValidationResult = {
  payload: unknown;
  status: string | null;
  title: string | null;
  itemCount: number;
  components: GovernedRecommendationValidationComponentPresence[];
  governance: GovernedRecommendationValidationGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
  repositoryInvoked: false;
  executesAction: false;
  draftApproved: false;
  automaticDecision: false;
};
