export const GOVERNED_CLINICAL_ASSISTANCE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};

export type GovernedClinicalAssistanceGovernance =
  typeof GOVERNED_CLINICAL_ASSISTANCE_GOVERNANCE;

export type GovernedClinicalAssistanceHitl = {
  requiresPhysicianReview: true;
  executesAction: false;
  autoPersistedToEmr: false;
  status: "awaiting_physician_review";
};

/** Composite assistance envelope — reuses existing package payloads (no new AI contract). */
export type GovernedClinicalAssistanceResult = {
  runtime: unknown;
  clinicalContext: unknown;
  clinicalPlan: unknown;
  clinicalOutput: unknown;
  decisionWorkspace: unknown;
  reviewSession: unknown;
  governance: GovernedClinicalAssistanceGovernance;
  hitl: GovernedClinicalAssistanceHitl;
  reason: string | null;
};
