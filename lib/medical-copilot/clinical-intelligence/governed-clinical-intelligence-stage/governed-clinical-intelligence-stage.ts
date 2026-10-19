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

export type GovernedClinicalIntelligenceStageGovernance = typeof GOVERNED_CLINICAL_REASONING_PIPELINE_UI_GOVERNANCE;

export type GovernedClinicalIntelligenceStageSurfaceRefView = {
  sourcePackage: string;
  surfaceKind: string;
  metricLabel: string;
  metricValue: number;
};

export type GovernedClinicalIntelligenceStageStageView = {
  order: number;
  kind: string;
  title: string;
  summary: string;
  sourcePackages: string[];
  surfaceRefs: GovernedClinicalIntelligenceStageSurfaceRefView[];
};

export type GovernedClinicalIntelligenceStageResult = {
  payload: unknown;
  status: string | null;
  title: string | null;
  stageCount: number;
  stages: GovernedClinicalIntelligenceStageStageView[];
  certifiedSourcesIntegrated: string[];
  governance: GovernedClinicalIntelligenceStageGovernance;
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
