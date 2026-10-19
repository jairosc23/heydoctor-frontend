export const GOVERNED_CARE_PLAN_DRAFT_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedCarePlanDraftGovernance =
  typeof GOVERNED_CARE_PLAN_DRAFT_GOVERNANCE;

export type GovernedCarePlanDraftSlotKey =
  | "primary_goal_slot"
  | "secondary_goals_slot"
  | "planned_interventions_slot"
  | "monitoring_strategy_slot"
  | "review_schedule_slot"
  | "care_plan_notes_slot";

export type GovernedCarePlanDraftItem = {
  slotKey: GovernedCarePlanDraftSlotKey;
  status: "empty_structural_slot";
  value: null;
  readOnly: true;
  persisted: false;
};

export type GovernedCarePlanDraftView = {
  status: "pending_physician_review";
  draftApproved: false;
  readOnly: true;
  persisted: false;
  carePlanItems: GovernedCarePlanDraftItem[];
  generatedAt: string;
};

/** Composite care plan draft envelope — empty structural slots only. */
export type GovernedCarePlanDraftResult = {
  clinicalVisitSummaryDraft: unknown;
  carePlanDraft: GovernedCarePlanDraftView;
  governance: GovernedCarePlanDraftGovernance;
  reason: string | null;
};
