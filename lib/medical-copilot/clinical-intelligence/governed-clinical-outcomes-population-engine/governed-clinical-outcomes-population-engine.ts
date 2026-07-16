export const GOVERNED_POPULATION_HEALTH_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const, executesAction: false as const, autoPersistedToEmr: false as const,
  draftApproved: false as const, writesEmr: false as const, repositoryInvoked: false as const,
  automaticDecision: false as const, usesLlm: false as const,
};
export type EnterpriseUiGovernance = typeof GOVERNED_POPULATION_HEALTH_UI_GOVERNANCE;
export type GovernedClinicalOutcomesPopulationEngineEntryView = {
  entryId: string; entryTitle: string; domain: string; topic: string; summary: string; explanation: string;
  evidenceRefs: string[]; populationRole: string; applicability: string; confidence: string;
};
export type GovernedClinicalOutcomesPopulationEngineResult = {
  payload: unknown; status: string | null; title: string | null; applicableCount: number; entries: GovernedClinicalOutcomesPopulationEngineEntryView[];
  enginesPresent: string[]; governance: EnterpriseUiGovernance; reason: string | null;
  readOnly: true; persisted: false; writesEmr: false; repositoryInvoked: false; executesAction: false;
  draftApproved: false; automaticDecision: false; usesLlm: false;
};
