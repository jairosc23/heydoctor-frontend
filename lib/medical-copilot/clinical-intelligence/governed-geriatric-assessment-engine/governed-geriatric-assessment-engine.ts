export const GOVERNED_SPECIALIZED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
};

export type GovernedGeriatricAssessmentEngineGovernance = typeof GOVERNED_SPECIALIZED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE;
export type GovernedGeriatricAssessmentEngineComponentKey = "engine" | "specialty" | "governance" | "hitl";
export type GovernedGeriatricAssessmentEngineComponentPresence = { key: GovernedGeriatricAssessmentEngineComponentKey; label: string; present: boolean; readOnly: true; persisted: false; };
export type GovernedGeriatricAssessmentEngineResult = {
  payload: unknown; status: string | null; title: string | null; itemCount: number;
  components: GovernedGeriatricAssessmentEngineComponentPresence[]; governance: GovernedGeriatricAssessmentEngineGovernance; reason: string | null;
  readOnly: true; persisted: false; writesEmr: false; repositoryInvoked: false; executesAction: false; draftApproved: false; automaticDecision: false;
};
