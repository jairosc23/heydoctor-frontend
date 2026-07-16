export const GOVERNED_CLINICAL_REASONING_PIPELINE_UI_GOVERNANCE = {
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

export type GovernedSuggestionsAggregationStageGovernance = typeof GOVERNED_CLINICAL_REASONING_PIPELINE_UI_GOVERNANCE;

export type GovernedSuggestionsAggregationStageSurfaceRefView = {
  sourcePackage: string;
  surfaceKind: string;
  metricLabel: string;
  metricValue: number;
};

export type GovernedSuggestionsAggregationStageStageView = {
  order: number;
  kind: string;
  title: string;
  summary: string;
  sourcePackages: string[];
  surfaceRefs: GovernedSuggestionsAggregationStageSurfaceRefView[];
};

export type GovernedSuggestionsAggregationStageResult = {
  payload: unknown;
  status: string | null;
  title: string | null;
  stageCount: number;
  stages: GovernedSuggestionsAggregationStageStageView[];
  certifiedSourcesIntegrated: string[];
  governance: GovernedSuggestionsAggregationStageGovernance;
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
