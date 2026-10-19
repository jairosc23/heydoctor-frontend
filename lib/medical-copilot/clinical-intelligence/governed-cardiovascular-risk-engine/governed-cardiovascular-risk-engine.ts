export const GOVERNED_SPECIALIZED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
};

export type GovernedCardiovascularRiskEngineGovernance = typeof GOVERNED_SPECIALIZED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE;
export type GovernedCardiovascularRiskEngineComponentKey = "engine" | "specialty" | "governance" | "hitl";
export type GovernedCardiovascularRiskEngineComponentPresence = { key: GovernedCardiovascularRiskEngineComponentKey; label: string; present: boolean; readOnly: true; persisted: false; };
export type GovernedCardiovascularRiskEngineResult = {
  payload: unknown; status: string | null; title: string | null; itemCount: number;
  components: GovernedCardiovascularRiskEngineComponentPresence[]; governance: GovernedCardiovascularRiskEngineGovernance; reason: string | null;
  readOnly: true; persisted: false; writesEmr: false; repositoryInvoked: false; executesAction: false; draftApproved: false; automaticDecision: false;
};
