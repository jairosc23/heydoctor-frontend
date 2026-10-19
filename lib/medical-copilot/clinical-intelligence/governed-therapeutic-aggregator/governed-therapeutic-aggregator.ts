export const GOVERNED_CLINICAL_AI_ORCHESTRATOR_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
  usesLlm: false as const,
  generatesNewClinicalContent: false as const,
};
export type GovernedClinicalAiOrchestratorGovernance = typeof GOVERNED_CLINICAL_AI_ORCHESTRATOR_UI_GOVERNANCE;
export type GovernedTherapeuticAggregatorRefView = {
  sourcePackage: string;
  surfaceKind: string;
  metricLabel: string;
  metricValue: number;
};
export type GovernedOrchestratorAggregatorView = {
  order: number;
  kind: string;
  title: string;
  summary: string;
  sourcePackages: string[];
  surfaceRefs: GovernedTherapeuticAggregatorRefView[];
};
export type GovernedTherapeuticAggregatorResult = {
  payload: unknown;
  status: string | null;
  title: string | null;
  aggregatorCount: number;
  aggregators: GovernedOrchestratorAggregatorView[];
  certifiedSourcesIntegrated: string[];
  surfaceRefs: GovernedTherapeuticAggregatorRefView[];
  sourcePackages: string[];
  summary: string | null;
  governance: GovernedClinicalAiOrchestratorGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
  repositoryInvoked: false;
  executesAction: false;
  draftApproved: false;
  automaticDecision: false;
  usesLlm: false;
  generatesNewClinicalContent: false;
};
