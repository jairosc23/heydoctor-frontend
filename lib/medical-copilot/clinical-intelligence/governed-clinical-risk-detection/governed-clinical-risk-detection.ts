export const GOVERNED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
};

export type GovernedClinicalRiskDetectionGovernance = typeof GOVERNED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE;

export type GovernedClinicalRiskDetectionComponentKey = "risk" | "intelligence" | "governance" | "hitl";

export type GovernedClinicalRiskDetectionComponentPresence = {
  key: GovernedClinicalRiskDetectionComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedClinicalRiskDetectionResult = {
  payload: unknown;
  status: string | null;
  title: string | null;
  itemCount: number;
  components: GovernedClinicalRiskDetectionComponentPresence[];
  governance: GovernedClinicalRiskDetectionGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
  repositoryInvoked: false;
  executesAction: false;
  draftApproved: false;
  automaticDecision: false;
};
