export const GOVERNED_FOLLOW_UP_DRAFT_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedFollowUpDraftGovernance =
  typeof GOVERNED_FOLLOW_UP_DRAFT_GOVERNANCE;

export type GovernedFollowUpDraftSlotKey =
  | "follow_up_type_slot"
  | "recommended_interval_slot"
  | "monitoring_items_slot"
  | "reevaluation_goals_slot"
  | "pending_results_slot"
  | "follow_up_notes_slot";

export type GovernedFollowUpDraftItem = {
  slotKey: GovernedFollowUpDraftSlotKey;
  status: "empty_structural_slot";
  value: null;
  readOnly: true;
  persisted: false;
};

export type GovernedFollowUpDraftView = {
  status: "pending_physician_review";
  draftApproved: false;
  readOnly: true;
  persisted: false;
  followUpItems: GovernedFollowUpDraftItem[];
  generatedAt: string;
};

/** Composite follow-up draft envelope — empty structural slots only. */
export type GovernedFollowUpDraftResult = {
  patientInstructionsDraft: unknown;
  followUpDraft: GovernedFollowUpDraftView;
  governance: GovernedFollowUpDraftGovernance;
  reason: string | null;
};
