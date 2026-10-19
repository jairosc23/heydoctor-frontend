export const GOVERNED_REFERRAL_DRAFT_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedReferralDraftGovernance =
  typeof GOVERNED_REFERRAL_DRAFT_GOVERNANCE;

export type GovernedReferralDraftSlotKey =
  | "specialty_slot"
  | "priority_slot"
  | "reason_slot"
  | "clinical_summary_slot"
  | "attached_documents_slot"
  | "destination_slot";

export type GovernedReferralDraftItem = {
  slotKey: GovernedReferralDraftSlotKey;
  status: "empty_structural_slot";
  value: null;
  readOnly: true;
  persisted: false;
};

export type GovernedReferralDraftView = {
  status: "pending_physician_review";
  draftApproved: false;
  readOnly: true;
  persisted: false;
  referralItems: GovernedReferralDraftItem[];
  generatedAt: string;
};

/** Composite referral draft envelope — empty structural slots only. */
export type GovernedReferralDraftResult = {
  ordersDraft: unknown;
  referralDraft: GovernedReferralDraftView;
  governance: GovernedReferralDraftGovernance;
  reason: string | null;
};
