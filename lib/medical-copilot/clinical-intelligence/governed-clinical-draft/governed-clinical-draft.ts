export const GOVERNED_CLINICAL_DRAFT_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalDraftGovernance =
  typeof GOVERNED_CLINICAL_DRAFT_GOVERNANCE;

export type GovernedClinicalDraftView = {
  status: "pending_physician_review";
  draftApproved: false;
  requiresPhysicianReview: true;
  executesAction: false;
  autoPersistedToEmr: false;
  persisted: false;
  readOnly: true;
  available: boolean;
  generatedAt: string;
};

/** Composite draft envelope — reuses existing package payloads (no new AI contract). */
export type GovernedClinicalDraftResult = {
  assistance: unknown;
  runtime: unknown;
  clinicalOutput: unknown;
  reviewSession: unknown;
  decisionWorkspace: unknown;
  draft: GovernedClinicalDraftView;
  governance: GovernedClinicalDraftGovernance;
  reason: string | null;
};
