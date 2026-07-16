export const GOVERNED_SPECIALIZED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
};

export type GovernedPreventiveHealthEngineGovernance = typeof GOVERNED_SPECIALIZED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE;
export type GovernedPreventiveHealthEngineComponentKey = "engine" | "specialty" | "governance" | "hitl";
export type GovernedPreventiveHealthEngineComponentPresence = { key: GovernedPreventiveHealthEngineComponentKey; label: string; present: boolean; readOnly: true; persisted: false; };
export type GovernedPreventiveHealthEngineResult = {
  payload: unknown; status: string | null; title: string | null; itemCount: number;
  components: GovernedPreventiveHealthEngineComponentPresence[]; governance: GovernedPreventiveHealthEngineGovernance; reason: string | null;
  readOnly: true; persisted: false; writesEmr: false; repositoryInvoked: false; executesAction: false; draftApproved: false; automaticDecision: false;
};
