export const GOVERNED_CLINICAL_INTELLIGENCE_RUNTIME_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};

export type GovernedClinicalIntelligenceRuntimeGovernance =
  typeof GOVERNED_CLINICAL_INTELLIGENCE_RUNTIME_GOVERNANCE;

/** Composite runtime envelope — reuses existing package payloads (no new AI contract). */
export type GovernedClinicalIntelligenceRuntimeResult = {
  foundation: unknown;
  providerExecution: unknown;
  processedResponse: unknown;
  clinicalOutput: unknown;
  physicianReview: unknown;
  governance: GovernedClinicalIntelligenceRuntimeGovernance;
  reason: string | null;
};
