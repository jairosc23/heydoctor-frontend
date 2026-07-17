export const GOVERNED_CLINICAL_VISIT_SUMMARY_DRAFT_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalVisitSummaryDraftGovernance =
  typeof GOVERNED_CLINICAL_VISIT_SUMMARY_DRAFT_GOVERNANCE;

export type GovernedClinicalVisitSummaryDraftSlotKey =
  | "consultation_reason_slot"
  | "clinical_findings_slot"
  | "assessment_reference_slot"
  | "performed_actions_slot"
  | "follow_up_reference_slot"
  | "closing_summary_slot";

export type GovernedClinicalVisitSummaryDraftItem = {
  slotKey: GovernedClinicalVisitSummaryDraftSlotKey;
  status: "empty_structural_slot";
  value: null;
  readOnly: true;
  persisted: false;
};

export type GovernedClinicalVisitSummaryDraftView = {
  status: "pending_physician_review";
  draftApproved: false;
  readOnly: true;
  persisted: false;
  summaryItems: GovernedClinicalVisitSummaryDraftItem[];
  generatedAt: string;
};

/** Composite clinical visit summary draft envelope — empty structural slots only. */
export type GovernedClinicalVisitSummaryDraftResult = {
  followUpDraft: unknown;
  clinicalVisitSummaryDraft: GovernedClinicalVisitSummaryDraftView;
  governance: GovernedClinicalVisitSummaryDraftGovernance;
  reason: string | null;
};
