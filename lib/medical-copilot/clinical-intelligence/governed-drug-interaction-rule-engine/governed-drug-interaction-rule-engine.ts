export const GOVERNED_DETERMINISTIC_CLINICAL_RULES_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
  usesLlm: false as const,
};

export type GovernedDrugInteractionRuleEngineGovernance = typeof GOVERNED_DETERMINISTIC_CLINICAL_RULES_UI_GOVERNANCE;

export type GovernedDrugInteractionRuleEngineEvaluationView = {
  ruleId: string;
  ruleName: string;
  condition: string;
  result: string;
  explanation: string;
  evidenceUsed: string[];
  confidence: string;
  priority: string;
};

export type GovernedDrugInteractionRuleEngineResult = {
  payload: unknown;
  status: string | null;
  title: string | null;
  triggeredCount: number;
  evaluations: GovernedDrugInteractionRuleEngineEvaluationView[];
  governance: GovernedDrugInteractionRuleEngineGovernance;
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
