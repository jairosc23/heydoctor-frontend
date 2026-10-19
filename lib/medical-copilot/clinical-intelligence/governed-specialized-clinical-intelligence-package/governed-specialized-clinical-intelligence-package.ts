export const GOVERNED_SPECIALIZED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
};

export type GovernedSpecializedClinicalIntelligencePackageGovernance = typeof GOVERNED_SPECIALIZED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE;
export type GovernedSpecializedClinicalIntelligencePackageComponentKey = "package" | "specialty" | "governance" | "hitl";
export type GovernedSpecializedClinicalIntelligencePackageComponentPresence = { key: GovernedSpecializedClinicalIntelligencePackageComponentKey; label: string; present: boolean; readOnly: true; persisted: false; };
export type GovernedSpecializedClinicalIntelligencePackageResult = {
  payload: unknown; status: string | null; title: string | null; itemCount: number;
  components: GovernedSpecializedClinicalIntelligencePackageComponentPresence[]; governance: GovernedSpecializedClinicalIntelligencePackageGovernance; reason: string | null;
  readOnly: true; persisted: false; writesEmr: false; repositoryInvoked: false; executesAction: false; draftApproved: false; automaticDecision: false;
};
