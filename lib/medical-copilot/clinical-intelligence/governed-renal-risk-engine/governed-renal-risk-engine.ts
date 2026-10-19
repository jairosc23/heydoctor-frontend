export const GOVERNED_SPECIALIZED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
};

export type GovernedRenalRiskEngineGovernance = typeof GOVERNED_SPECIALIZED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE;
export type GovernedRenalRiskEngineComponentKey = "engine" | "specialty" | "governance" | "hitl";
export type GovernedRenalRiskEngineComponentPresence = { key: GovernedRenalRiskEngineComponentKey; label: string; present: boolean; readOnly: true; persisted: false; };
export type GovernedRenalRiskEngineResult = {
  payload: unknown; status: string | null; title: string | null; itemCount: number;
  components: GovernedRenalRiskEngineComponentPresence[]; governance: GovernedRenalRiskEngineGovernance; reason: string | null;
  readOnly: true; persisted: false; writesEmr: false; repositoryInvoked: false; executesAction: false; draftApproved: false; automaticDecision: false;
};
