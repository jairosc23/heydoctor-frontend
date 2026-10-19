export const GOVERNED_CLINICAL_WORKFLOW_ENGINE_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
  usesLlm: false as const,
  generatesNewClinicalContent: false as const,
  executesWorkflow: false as const,
};
export type GovernedClinicalWorkflowEngineUiGovernance = typeof GOVERNED_CLINICAL_WORKFLOW_ENGINE_UI_GOVERNANCE;
export type GovernedClinicalGuidelinesWorkflowRefView = {
  sourcePackage: string;
  surfaceKind: string;
  metricLabel: string;
  metricValue: number;
};
export type GovernedClinicalWorkflowView = {
  order: number;
  workflowId: string;
  workflowType: string;
  title: string;
  summary: string;
  sourcePackages: string[];
  surfaceRefs: GovernedClinicalGuidelinesWorkflowRefView[];
  currentStage: string;
  nextStage: string | null;
  completedStages: string[];
  pendingStages: string[];
};
export type GovernedClinicalGuidelinesWorkflowResult = {
  payload: unknown;
  status: string | null;
  title: string | null;
  workflowCount: number;
  workflows: GovernedClinicalWorkflowView[];
  certifiedSourcesIntegrated: string[];
  surfaceRefs: GovernedClinicalGuidelinesWorkflowRefView[];
  sourcePackages: string[];
  summary: string | null;
  workflowId: string | null;
  workflowType: string | null;
  currentStage: string | null;
  nextStage: string | null;
  completedStages: string[];
  pendingStages: string[];
  governance: GovernedClinicalWorkflowEngineUiGovernance;
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
  executesWorkflow: false;
};
