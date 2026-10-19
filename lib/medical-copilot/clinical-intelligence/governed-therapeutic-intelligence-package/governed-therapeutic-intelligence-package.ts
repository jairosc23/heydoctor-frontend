export const GOVERNED_THERAPEUTIC_INTELLIGENCE_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const, executesAction: false as const, autoPersistedToEmr: false as const,
  draftApproved: false as const, writesEmr: false as const, repositoryInvoked: false as const,
  automaticDecision: false as const, usesLlm: false as const,
};
export type EnterpriseUiGovernance = typeof GOVERNED_THERAPEUTIC_INTELLIGENCE_UI_GOVERNANCE;
export type GovernedTherapeuticIntelligencePackageEntryView = {
  entryId: string; entryTitle: string; domain: string; topic: string; summary: string; explanation: string;
  evidenceRefs: string[]; therapeuticRole: string; applicability: string; confidence: string;
};
export type GovernedTherapeuticIntelligencePackageResult = {
  payload: unknown; status: string | null; title: string | null; applicableCount: number; entries: GovernedTherapeuticIntelligencePackageEntryView[];
  enginesPresent: string[]; governance: EnterpriseUiGovernance; reason: string | null;
  readOnly: true; persisted: false; writesEmr: false; repositoryInvoked: false; executesAction: false;
  draftApproved: false; automaticDecision: false; usesLlm: false;
};
