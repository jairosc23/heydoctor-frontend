export const GOVERNED_CLINICAL_FUNCTIONAL_INTELLIGENCE_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
};

export type GovernedClinicalFunctionalIntelligencePackageGovernance = typeof GOVERNED_CLINICAL_FUNCTIONAL_INTELLIGENCE_UI_GOVERNANCE;
export type GovernedClinicalFunctionalIntelligencePackageComponentKey = "package" | "intelligence" | "governance" | "hitl";
export type GovernedClinicalFunctionalIntelligencePackageComponentPresence = { key: GovernedClinicalFunctionalIntelligencePackageComponentKey; label: string; present: boolean; readOnly: true; persisted: false; };
export type GovernedClinicalFunctionalIntelligencePackageResult = {
  payload: unknown; status: string | null; title: string | null; itemCount: number;
  components: GovernedClinicalFunctionalIntelligencePackageComponentPresence[]; governance: GovernedClinicalFunctionalIntelligencePackageGovernance; reason: string | null;
  readOnly: true; persisted: false; writesEmr: false; repositoryInvoked: false; executesAction: false; draftApproved: false; automaticDecision: false;
};
