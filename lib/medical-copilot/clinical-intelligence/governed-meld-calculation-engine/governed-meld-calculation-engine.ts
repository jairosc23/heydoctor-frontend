export const GOVERNED_CLINICAL_CALCULATION_SYSTEM_ENTERPRISE_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
  usesLlm: false as const,
};
export type EnterpriseUiGovernance = typeof GOVERNED_CLINICAL_CALCULATION_SYSTEM_ENTERPRISE_UI_GOVERNANCE;
export type GovernedMeldCalculationEngineEntryView = {
  entryId: string; entryTitle: string; domain: string; topic: string; summary: string; explanation: string; evidenceRefs: string[];
  formulaId: string;
  resultValue: number | null;
  resultUnit: string | null;
  inputsUsed: string[];
  applicability: string; confidence: string;
};
export type GovernedMeldCalculationEngineResult = {
  payload: unknown; status: string | null; title: string | null; applicableCount: number; entries: GovernedMeldCalculationEngineEntryView[]; enginesPresent: string[];
  governance: EnterpriseUiGovernance; reason: string | null;
  readOnly: true; persisted: false; writesEmr: false; repositoryInvoked: false; executesAction: false; draftApproved: false; automaticDecision: false; usesLlm: false;
};
