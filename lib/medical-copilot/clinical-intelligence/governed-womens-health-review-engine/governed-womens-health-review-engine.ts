export const GOVERNED_SPECIALIZED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
};

export type GovernedWomensHealthReviewEngineGovernance = typeof GOVERNED_SPECIALIZED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE;
export type GovernedWomensHealthReviewEngineComponentKey = "engine" | "specialty" | "governance" | "hitl";
export type GovernedWomensHealthReviewEngineComponentPresence = { key: GovernedWomensHealthReviewEngineComponentKey; label: string; present: boolean; readOnly: true; persisted: false; };
export type GovernedWomensHealthReviewEngineResult = {
  payload: unknown; status: string | null; title: string | null; itemCount: number;
  components: GovernedWomensHealthReviewEngineComponentPresence[]; governance: GovernedWomensHealthReviewEngineGovernance; reason: string | null;
  readOnly: true; persisted: false; writesEmr: false; repositoryInvoked: false; executesAction: false; draftApproved: false; automaticDecision: false;
};
