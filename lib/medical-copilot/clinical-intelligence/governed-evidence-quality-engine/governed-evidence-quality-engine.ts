export const GOVERNED_CLINICAL_EVIDENCE_ENGINE_ENTERPRISE_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
  usesLlm: false as const,
};

export type GovernedClinicalEvidenceEngineEnterpriseGovernance = typeof GOVERNED_CLINICAL_EVIDENCE_ENGINE_ENTERPRISE_UI_GOVERNANCE;

export type GovernedEvidenceQualityEngineEntryView = {
  entryId: string;
  entryTitle: string;
  domain: string;
  topic: string;
  summary: string;
  explanation: string;
  evidenceRefs: string[];
  evidenceLevel: string;
  applicability: string;
  confidence: string;
};

export type GovernedEvidenceQualityEngineResult = {
  payload: unknown;
  status: string | null;
  title: string | null;
  applicableCount: number;
  entries: GovernedEvidenceQualityEngineEntryView[];
  enginesPresent: string[];
  governance: GovernedClinicalEvidenceEngineEnterpriseGovernance;
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
