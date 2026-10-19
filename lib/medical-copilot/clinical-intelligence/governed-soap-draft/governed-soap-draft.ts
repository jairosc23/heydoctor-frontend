export const GOVERNED_SOAP_DRAFT_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedSoapDraftGovernance = typeof GOVERNED_SOAP_DRAFT_GOVERNANCE;

export type GovernedSoapDraftSection = {
  section: "subjective" | "objective" | "assessment" | "plan";
  status: "empty_structural_slot";
  items: [];
  sourceRef: string | null;
  readOnly: true;
  persisted: false;
};

/** Composite SOAP draft envelope — structural slots only (no new AI contract). */
export type GovernedSoapDraftResult = {
  clinicalDraft: unknown;
  subjective: GovernedSoapDraftSection;
  objective: GovernedSoapDraftSection;
  assessment: GovernedSoapDraftSection;
  plan: GovernedSoapDraftSection;
  governance: GovernedSoapDraftGovernance;
  reason: string | null;
};
