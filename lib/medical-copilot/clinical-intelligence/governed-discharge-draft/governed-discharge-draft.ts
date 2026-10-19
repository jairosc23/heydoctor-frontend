export const GOVERNED_DISCHARGE_DRAFT_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedDischargeDraftGovernance =
  typeof GOVERNED_DISCHARGE_DRAFT_GOVERNANCE;

export type GovernedDischargeDraftSlotKey =
  | "discharge_condition_slot"
  | "discharge_destination_slot"
  | "discharge_medications_slot"
  | "discharge_followup_slot"
  | "discharge_precautions_slot"
  | "discharge_notes_slot";

export type GovernedDischargeDraftItem = {
  slotKey: GovernedDischargeDraftSlotKey;
  status: "empty_structural_slot";
  value: null;
  readOnly: true;
  persisted: false;
};

export type GovernedDischargeDraftView = {
  status: "pending_physician_review";
  draftApproved: false;
  readOnly: true;
  persisted: false;
  dischargeItems: GovernedDischargeDraftItem[];
  generatedAt: string;
};

/** Composite discharge draft envelope — empty structural slots only. */
export type GovernedDischargeDraftResult = {
  patientEducationDraft: unknown;
  dischargeDraft: GovernedDischargeDraftView;
  governance: GovernedDischargeDraftGovernance;
  reason: string | null;
};
