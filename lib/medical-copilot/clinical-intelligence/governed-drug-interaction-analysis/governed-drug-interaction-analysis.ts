export const GOVERNED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
};

export type GovernedDrugInteractionAnalysisGovernance = typeof GOVERNED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE;

export type GovernedDrugInteractionAnalysisComponentKey = "analysis" | "intelligence" | "governance" | "hitl";

export type GovernedDrugInteractionAnalysisComponentPresence = {
  key: GovernedDrugInteractionAnalysisComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedDrugInteractionAnalysisResult = {
  payload: unknown;
  status: string | null;
  title: string | null;
  itemCount: number;
  components: GovernedDrugInteractionAnalysisComponentPresence[];
  governance: GovernedDrugInteractionAnalysisGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
  repositoryInvoked: false;
  executesAction: false;
  draftApproved: false;
  automaticDecision: false;
};
