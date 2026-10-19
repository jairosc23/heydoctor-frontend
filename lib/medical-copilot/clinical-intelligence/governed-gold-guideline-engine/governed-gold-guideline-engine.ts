export const GOVERNED_CLINICAL_GUIDELINES_ENGINE_ENTERPRISE_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
  usesLlm: false as const,
};

export type GovernedClinicalGuidelinesEngineEnterpriseGovernance = typeof GOVERNED_CLINICAL_GUIDELINES_ENGINE_ENTERPRISE_UI_GOVERNANCE;

export type GovernedGoldGuidelineEngineEntryView = {
  entryId: string;
  entryTitle: string;
  domain: string;
  topic: string;
  summary: string;
  explanation: string;
  evidenceRefs: string[];
  guidelineBody: string;
  applicability: string;
  confidence: string;
};

export type GovernedGoldGuidelineEngineResult = {
  payload: unknown;
  status: string | null;
  title: string | null;
  applicableCount: number;
  entries: GovernedGoldGuidelineEngineEntryView[];
  enginesPresent: string[];
  governance: GovernedClinicalGuidelinesEngineEnterpriseGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
  repositoryInvoked: false;
  executesAction: false;
  draftApproved: false;
  automaticDecision: false;
  usesLlm: false;
};
