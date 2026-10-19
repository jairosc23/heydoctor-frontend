export const GOVERNED_CONSULTATION_REVIEW_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedConsultationReviewGovernance = typeof GOVERNED_CONSULTATION_REVIEW_GOVERNANCE;

export type GovernedConsultationReviewComponentKey =
  | "consultationSnapshot"
  | "physicianWorkspace"
  | "documentationPackage";

export type GovernedConsultationReviewComponentPresence = {
  key: GovernedConsultationReviewComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedConsultationReviewResult = {
  consultationSnapshot: unknown;
  physicianWorkspace: unknown;
  documentationPackage: unknown;
  components: GovernedConsultationReviewComponentPresence[];
  governance: GovernedConsultationReviewGovernance;
  reason: string | null;
};
