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

export type GovernedClinicalIntakeStageGovernance = typeof GOVERNED_CLINICAL_REASONING_PIPELINE_UI_GOVERNANCE;

export type GovernedClinicalIntakeStageSurfaceRefView = {
  sourcePackage: string;
  surfaceKind: string;
  metricLabel: string;
  metricValue: number;
};

export type GovernedClinicalIntakeStageStageView = {
  order: number;
  kind: string;
  title: string;
  summary: string;
  sourcePackages: string[];
  surfaceRefs: GovernedClinicalIntakeStageSurfaceRefView[];
};

export type GovernedClinicalIntakeStageResult = {
  payload: unknown;
  status: string | null;
  title: string | null;
  stageCount: number;
  stages: GovernedClinicalIntakeStageStageView[];
  certifiedSourcesIntegrated: string[];
  governance: GovernedClinicalIntakeStageGovernance;
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
